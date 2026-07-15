import Ajv2020 from 'ajv/dist/2020'
import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const truthRoot = join(root, 'packages/truth')
const upstreamRepository = 'https://github.com/worldcoin/mobile-bench-rs'
const upstreamSlug = 'worldcoin/mobile-bench-rs'
const manifestName = 'mobench-site-manifest-v1.json'

const usage = `Usage:
  bun run sync:release -- --tag vX.Y.Z --expected-manifest-sha256 <sha256>

Downloads the manifest release asset, resolves the exact tag commit, verifies all
schema and fixture snapshots against that commit, then updates the offline truth
package. The command never reads mobile-bench-rs/main.

Required:
  --tag                           Explicit stable release tag
  --expected-manifest-sha256      Trusted SHA-256 from the release checksum asset

Environment:
  GH_TOKEN or GITHUB_TOKEN        Optional for local use; required in GitHub Actions
`

type Arguments = { tag?: string; expectedManifestSha256?: string; help: boolean }
type ReleaseAsset = { name: string; url: string }
type Release = { tag_name: string; draft: boolean; prerelease: boolean; assets: ReleaseAsset[] }
type GitObject = { type: 'commit' | 'tag'; sha: string }
type GitRef = { object: GitObject }
type GitTag = { object: GitObject }
type Manifest = {
  schema_version: number
  release: { version: string; tag: string; sha: string; repository: string }
  schemas: Array<{ id: string; path: string; checksum_sha256: string }>
}
type Pin = {
  schemaVersion: number
  repository: string
  release: string
  version: string
  commitSha: string
  manifestSha256: string
  syncedAt: string
  buildPolicy: string
}

function parseArguments(argv: string[]): Arguments {
  const parsed: Arguments = { help: false }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') {
      parsed.help = true
      continue
    }
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`)
    if (argument === '--tag') parsed.tag = value
    else if (argument === '--expected-manifest-sha256') parsed.expectedManifestSha256 = value.toLowerCase()
    else throw new Error(`Unknown argument: ${argument}`)
    index += 1
  }
  return parsed
}

function sha256(bytes: Uint8Array | string) {
  return createHash('sha256').update(bytes).digest('hex')
}

function requestHeaders(accept = 'application/vnd.github+json') {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  return {
    Accept: accept,
    'User-Agent': 'mobench-site-release-sync',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchBytes(url: string, accept?: string) {
  const response = await fetch(url, { headers: requestHeaders(accept), redirect: 'follow' })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} while fetching ${url}`)
  return new Uint8Array(await response.arrayBuffer())
}

async function fetchJson<T>(url: string): Promise<T> {
  return JSON.parse(new TextDecoder().decode(await fetchBytes(url))) as T
}

function githubApi(path: string) {
  return `https://api.github.com/repos/${upstreamSlug}${path}`
}

async function resolveTagCommit(tag: string) {
  const reference = await fetchJson<GitRef>(githubApi(`/git/ref/tags/${encodeURIComponent(tag)}`))
  let object = reference.object
  for (let depth = 0; object.type === 'tag' && depth < 4; depth += 1) {
    object = (await fetchJson<GitTag>(githubApi(`/git/tags/${object.sha}`))).object
  }
  if (object.type !== 'commit') throw new Error(`Tag ${tag} did not resolve to a commit`)
  return object.sha
}

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  }))).flat().sort()
}

async function verifiedReleaseInputs(tag: string, expectedChecksum: string) {
  const release = await fetchJson<Release>(githubApi(`/releases/tags/${encodeURIComponent(tag)}`))
  if (release.tag_name !== tag || release.draft || release.prerelease) throw new Error(`${tag} is not a published stable release`)
  const asset = release.assets.find((candidate) => candidate.name === manifestName)
  if (!asset) throw new Error(`${tag} does not publish ${manifestName}`)
  const manifestBytes = await fetchBytes(asset.url, 'application/octet-stream')
  const actualChecksum = sha256(manifestBytes)
  if (actualChecksum !== expectedChecksum) {
    throw new Error(`Manifest checksum mismatch: expected ${expectedChecksum}, received ${actualChecksum}`)
  }
  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes)) as Manifest
  const version = tag.replace(/^v/, '')
  const commitSha = await resolveTagCommit(tag)
  if (manifest.schema_version !== 1) throw new Error(`Unsupported manifest schema ${manifest.schema_version}`)
  if (manifest.release.tag !== tag || manifest.release.version !== version) throw new Error('Manifest release identity does not match the requested tag')
  if (manifest.release.sha !== commitSha) throw new Error('Manifest commit does not match the resolved release tag')
  if (manifest.release.repository !== upstreamRepository) throw new Error(`Unexpected manifest repository: ${manifest.release.repository}`)

  const snapshots = new Map<string, Uint8Array>()
  for (const schema of manifest.schemas) {
    const bytes = await fetchBytes(`https://raw.githubusercontent.com/${upstreamSlug}/${commitSha}/${schema.path}`)
    if (sha256(bytes) !== schema.checksum_sha256) throw new Error(`Schema checksum mismatch for ${schema.id}`)
    snapshots.set(`schemas/${basename(schema.path)}`, bytes)
  }
  for (const [source, target] of [
    ['examples/fixtures/basic/summary.json', 'fixtures/summary-basic.json'],
    ['examples/fixtures/ffi/summary.json', 'fixtures/summary-ffi.json'],
  ] as const) {
    snapshots.set(target, await fetchBytes(`https://raw.githubusercontent.com/${upstreamSlug}/${commitSha}/${source}`))
  }

  const manifestSchema = snapshots.get('schemas/mobench-site-manifest-v1.schema.json')
  const summarySchema = snapshots.get('schemas/summary-v1.schema.json')
  if (!manifestSchema || !summarySchema) throw new Error('Manifest does not reference the required website and summary schemas')
  const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false })
  const validateManifest = ajv.compile(JSON.parse(new TextDecoder().decode(manifestSchema)))
  if (!validateManifest(manifest)) throw new Error(`Manifest schema errors: ${ajv.errorsText(validateManifest.errors)}`)
  const validateSummary = ajv.compile(JSON.parse(new TextDecoder().decode(summarySchema)))
  for (const fixture of ['fixtures/summary-basic.json', 'fixtures/summary-ffi.json']) {
    const value = JSON.parse(new TextDecoder().decode(snapshots.get(fixture)!))
    if (!validateSummary(value)) throw new Error(`${fixture} schema errors: ${ajv.errorsText(validateSummary.errors)}`)
  }
  return { manifest, manifestBytes, snapshots, version, commitSha, actualChecksum }
}

function replaceReleaseIdentity(source: string, previous: Pin, next: Pin) {
  return source
    .replaceAll(previous.commitSha, next.commitSha)
    .replaceAll(previous.release, next.release)
    .replaceAll(previous.version, next.version)
    .replace(/^lastVerified:\s*\d{4}-\d{2}-\d{2}$/gm, `lastVerified: ${next.syncedAt}`)
}

async function writeVerifiedInputs(input: Awaited<ReturnType<typeof verifiedReleaseInputs>>, previous: Pin) {
  const next: Pin = {
    schemaVersion: 1,
    repository: upstreamRepository,
    release: input.manifest.release.tag,
    version: input.manifest.release.version,
    commitSha: input.commitSha,
    manifestSha256: input.actualChecksum,
    syncedAt: new Date().toISOString().slice(0, 10),
    buildPolicy: 'offline-pinned',
  }
  await writeFile(join(truthRoot, manifestName), input.manifestBytes)
  for (const [relativePath, bytes] of input.snapshots) {
    const path = join(truthRoot, relativePath)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, bytes)
  }
  await writeFile(join(truthRoot, 'pin.json'), `${JSON.stringify(next, null, 2)}\n`)

  const packagePath = join(truthRoot, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as Record<string, unknown>
  packageJson.version = next.version
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

  const versionedFiles = [
    ...(await filesUnder(join(root, 'apps/docs/src/content/docs'))).filter((path) => /\.mdx?$/.test(path)),
    join(root, 'apps/marketing/src/pages/index.astro'),
    join(root, 'README.md'),
    join(root, 'docs/AUTHORING.md'),
    join(root, 'packages/truth/README.md'),
  ]
  for (const path of versionedFiles) {
    const source = await readFile(path, 'utf8')
    const updated = replaceReleaseIdentity(source, previous, next)
    if (updated !== source) await writeFile(path, updated)
  }
  console.log(`Pinned mobench ${next.release} at ${next.commitSha} (${next.manifestSha256}).`)
  console.log('Run bun install, bun run generate, and the complete validation suite before opening a pull request.')
}

async function main() {
  const args = parseArguments(process.argv.slice(2))
  if (args.help) {
    console.log(usage)
    return
  }
  if (!args.tag || !/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(args.tag)) throw new Error('--tag must be an explicit vX.Y.Z release tag')
  if (!args.expectedManifestSha256 || !/^[0-9a-f]{64}$/.test(args.expectedManifestSha256)) {
    throw new Error('--expected-manifest-sha256 must be a 64-character hexadecimal checksum')
  }
  const previous = JSON.parse(await readFile(join(truthRoot, 'pin.json'), 'utf8')) as Pin
  const input = await verifiedReleaseInputs(args.tag, args.expectedManifestSha256)
  await writeVerifiedInputs(input, previous)
}

await main()
