import { parse as parseYaml } from 'yaml'
import Ajv2020 from 'ajv/dist/2020'
import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const docsRoot = join(root, 'apps/docs/src/content/docs')
const manifestPath = join(root, 'packages/truth/mobench-site-manifest-v1.json')
const pinPath = join(root, 'packages/truth/pin.json')

type OptionContract = { long: string | null }
type CommandContract = {
  name: string
  path: string
  options: OptionContract[]
  subcommands: CommandContract[]
}
type Manifest = {
  schema_version: number
  release: { version: string; tag: string; sha: string; repository: string }
  binaries: Array<{ name: string; canonical_for_release: boolean; status: string }>
  command_tree: CommandContract
  schemas: Array<{ id: string; path: string; checksum_sha256: string }>
  config: Array<{
    file: string
    keys: Array<{ path: string; evidence_id: string }>
  }>
  capabilities: Array<{ id: string; status: string; evidence_ids: string[] }>
  evidence: Array<{ id: string }>
}
type Frontmatter = {
  slug?: string
  title?: string
  description?: string
  release?: string | number
  lastVerified?: string | Date
  sourceRefs?: Array<{ label?: string; url?: string; evidence?: string }>
  aliases?: string[]
  draft?: boolean
}
type Page = {
  file: string
  route: string
  data: Frontmatter
  body: string
}

const failures: string[] = []
const fail = (message: string) => failures.push(message)

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  }))
  return nested.flat().sort()
}

function parsePage(file: string, source: string): Page {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!match) throw new Error('missing YAML frontmatter')
  const data = parseYaml(match[1]) as Frontmatter
  const path = relative(docsRoot, file).replaceAll('\\', '/').replace(/\.mdx?$/, '')
  const slug = data.slug ?? (path === 'index' ? 'index' : path.replace(/\/index$/, ''))
  return { file, route: slug === 'index' ? '/' : `/${slug}/`, data, body: source.slice(match[0].length) }
}

function shellTokens(command: string): string[] {
  return command.match(/(?:"[^"]*"|'[^']*'|[^\s])+/g)?.map((token) => token.replace(/^(?:"|')|(?:"|')$/g, '')) ?? []
}

function commandLines(body: string): string[] {
  const commands: string[] = []
  const fence = /```(?:bash|console|sh)(?:[^\n]*)\n([\s\S]*?)```/g
  for (const block of body.matchAll(fence)) {
    let pending = ''
    for (const rawLine of block[1].split(/\r?\n/)) {
      const line = rawLine.trim().replace(/^\$\s+/, '')
      if (!line || line.startsWith('#')) continue
      if (/^(export|unset)\s/.test(line)) continue
      pending += `${pending ? ' ' : ''}${line.replace(/\\$/, '').trim()}`
      if (!line.endsWith('\\')) {
        if (pending.startsWith('mobench ')) commands.push(pending)
        pending = ''
      }
    }
    if (pending.startsWith('mobench ')) commands.push(pending)
  }
  return commands
}

function taggedJsonExamples(body: string) {
  return [...body.matchAll(/```json[^\n]*\btest=schema:([^\s]+)[^\n]*\n([\s\S]*?)```/g)]
    .map((match) => ({ schemaId: match[1], source: match[2] }))
}

function taggedConfigExamples(body: string) {
  return [...body.matchAll(/```toml[^\n]*\btest=config:([^\s]+)[^\n]*\n([\s\S]*?)```/g)]
    .map((match) => ({ file: match[1], source: match[2] }))
}

function tomlKeyPaths(source: string) {
  const keys: string[] = []
  let section = ''
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '').trim()
    const sectionMatch = /^\[([A-Za-z0-9_.-]+)\]$/.exec(line)
    if (sectionMatch) {
      section = sectionMatch[1]
      continue
    }
    const keyMatch = /^([A-Za-z0-9_.-]+)\s*=/.exec(line)
    if (keyMatch) keys.push(section ? `${section}.${keyMatch[1]}` : keyMatch[1])
  }
  return keys
}

function validateCommand(command: string, rootCommand: CommandContract, context: string) {
  const tokens = shellTokens(command)
  if (tokens[0] !== 'mobench') return
  let current = rootCommand
  const chain = [rootCommand]
  for (const token of tokens.slice(1)) {
    if (token.startsWith('-')) continue
    const next = current.subcommands.find((candidate) => candidate.name === token)
    if (!next) continue
    current = next
    chain.push(next)
  }
  const allowed = new Set(chain.flatMap((node) => node.options.flatMap((option) => option.long ? [`--${option.long}`] : [])))
  for (const token of tokens.slice(1)) {
    if (!token.startsWith('--')) continue
    const flag = token.split('=', 1)[0]
    if (!allowed.has(flag)) fail(`${context}: unknown option ${flag} in \`${command}\``)
  }
  const commandPath = chain.map((node) => node.name).join(' ')
  const flags = new Set(tokens.filter((token) => token.startsWith('--')).map((token) => token.split('=', 1)[0]))
  if (commandPath === 'mobench ci run' && flags.has('--browserstack')) fail(`${context}: ci run does not accept --browserstack`)
  if (commandPath === 'mobench ci run' && flags.has('--output')) fail(`${context}: ci run requires --output-dir`)
  if (commandPath === 'mobench profile run' && flags.has('--output')) fail(`${context}: profile run requires --output-dir`)
}

function normalizeRoute(pathname: string) {
  if (extname(pathname)) return pathname
  return pathname === '/' ? '/' : `${pathname.replace(/\/$/, '')}/`
}

function validateLinks(page: Page, canonicalRoutes: Set<string>, aliasRoutes: Set<string>) {
  for (const match of page.body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const href = match[1].trim().replace(/^<|>$/g, '')
    if (!href || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue
    const resolved = new URL(href, `https://docs.mobench.org${page.route}`)
    const route = normalizeRoute(resolved.pathname)
    if (!canonicalRoutes.has(route) && !aliasRoutes.has(route)) {
      fail(`${relative(root, page.file)}: internal link ${href} resolves to missing ${route}`)
    }
  }
}

async function main() {
  const [manifestSource, pinSource] = await Promise.all([
    readFile(manifestPath, 'utf8'),
    readFile(pinPath, 'utf8'),
  ])
  const manifest = JSON.parse(manifestSource) as Manifest
  const pin = JSON.parse(pinSource) as {
    release: string
    version: string
    commitSha: string
    manifestSha256: string
  }
  const manifestChecksum = createHash('sha256').update(manifestSource).digest('hex')
  if (manifestChecksum !== pin.manifestSha256) fail('pinned manifest checksum does not match pin.json')
  if (manifest.schema_version !== 1) fail(`unsupported manifest schema ${manifest.schema_version}`)
  if (manifest.release.tag !== pin.release || manifest.release.version !== pin.version || manifest.release.sha !== pin.commitSha) {
    fail('manifest release identity does not match pin.json')
  }
  if (manifest.release.repository !== 'https://github.com/worldcoin/mobile-bench-rs') fail('unexpected upstream repository')
  const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false })
  const manifestSchemaSource = await readFile(join(root, 'packages/truth/schemas/mobench-site-manifest-v1.schema.json'), 'utf8')
  const validateManifest = ajv.compile(JSON.parse(manifestSchemaSource))
  if (!validateManifest(manifest)) fail(`manifest JSON Schema errors: ${ajv.errorsText(validateManifest.errors)}`)
  const schemaValidators = new Map<string, ReturnType<typeof ajv.compile>>()
  for (const schema of manifest.schemas) {
    const source = await readFile(join(root, 'packages/truth/schemas', schema.path.split('/').at(-1)!), 'utf8')
    const checksum = createHash('sha256').update(source).digest('hex')
    if (checksum !== schema.checksum_sha256) fail(`schema checksum mismatch for ${schema.id}`)
    schemaValidators.set(
      schema.id,
      schema.id === 'mobench-site-manifest-v1' ? validateManifest : ajv.compile(JSON.parse(source)),
    )
  }
  const validateSummary = schemaValidators.get('summary-v1')!
  for (const fixture of ['summary-basic.json', 'summary-ffi.json']) {
    const value = JSON.parse(await readFile(join(root, 'packages/truth/fixtures', fixture), 'utf8'))
    if (!validateSummary(value)) fail(`${fixture} schema errors: ${ajv.errorsText(validateSummary.errors)}`)
  }
  const canonicalBinary = manifest.binaries.find((binary) => binary.canonical_for_release)
  if (canonicalBinary?.name !== 'mobench' || canonicalBinary.status !== 'supported') fail('mobench must be the supported canonical release binary')
  const cargoWrapper = manifest.binaries.find((binary) => binary.name === 'cargo-mobench')
  if (!cargoWrapper) fail('manifest must describe the cargo-mobench wrapper')
  if (cargoWrapper?.canonical_for_release) fail('cargo-mobench must not replace the canonical mobench executable')
  const evidenceIds = new Set(manifest.evidence.map((item) => item.id))
  for (const capability of manifest.capabilities) {
    if (!['supported', 'preview', 'planned', 'unsupported'].includes(capability.status)) fail(`invalid capability status for ${capability.id}`)
    if (!capability.evidence_ids.length || capability.evidence_ids.some((id) => !evidenceIds.has(id))) fail(`capability ${capability.id} has invalid evidence`)
  }
  const configKeys = new Map(manifest.config.map((entry) => [
    entry.file,
    new Set(entry.keys.map((key) => key.path)),
  ]))

  const pages: Page[] = []
  for (const file of (await filesUnder(docsRoot)).filter((path) => /\.mdx?$/.test(path))) {
    try {
      pages.push(parsePage(file, await readFile(file, 'utf8')))
    } catch (error) {
      fail(`${relative(root, file)}: ${error instanceof Error ? error.message : error}`)
    }
  }
  const canonicalRoutes = new Set<string>()
  const aliasRoutes = new Set<string>()
  let cliPage: Page | undefined
  let configurationPage: Page | undefined
  for (const page of pages) {
    const name = relative(root, page.file)
    if (canonicalRoutes.has(page.route)) fail(`${name}: duplicate route ${page.route}`)
    canonicalRoutes.add(page.route)
    if (!page.data.title || !page.data.description) fail(`${name}: title and description are required`)
    if (String(page.data.release) !== pin.version) fail(`${name}: release must be ${pin.version}`)
    if (!page.data.lastVerified) fail(`${name}: lastVerified is required`)
    if (!page.data.sourceRefs?.length) fail(`${name}: at least one sourceRefs entry is required`)
    for (const source of page.data.sourceRefs ?? []) {
      if (!source.label || !source.url || !source.evidence) fail(`${name}: each source reference needs label, url, and evidence`)
      if (source.url?.includes('github.com/worldfnd/mobile-bench-rs')) fail(`${name}: source URL uses the wrong GitHub organization`)
    }
    for (const alias of page.data.aliases ?? []) {
      const route = normalizeRoute(alias)
      if (aliasRoutes.has(route)) fail(`${name}: duplicate alias ${route}`)
      aliasRoutes.add(route)
    }
    const copy = `${page.data.title}\n${page.data.description}\n${page.body}`
    if (cargoWrapper?.status !== 'supported' && /cargo\s+mobench\b/.test(copy)) fail(`${name}: stable examples must use the mobench executable`)
    if (/--local(?!-only)\b/.test(copy)) fail(`${name}: invalid --local option`)
    if (/95\s*[%–-]\s*99\s*%|95%\s*(?:to|[-–])\s*99%/i.test(copy)) fail(`${name}: unsupported device-coverage percentage`)
    if (/(?:runs?|exercises?) (?:only )?the host harness/i.test(copy)) fail(`${name}: --local-only must not imply benchmark execution`)
    for (const command of commandLines(page.body)) validateCommand(command, manifest.command_tree, name)
    for (const example of taggedConfigExamples(page.body)) {
      const allowed = configKeys.get(example.file)
      if (!allowed) {
        fail(`${name}: unknown configuration contract ${example.file}`)
        continue
      }
      for (const key of tomlKeyPaths(example.source)) {
        if (!allowed.has(key)) fail(`${name}: ${key} is not published in ${example.file}`)
      }
    }
    for (const example of taggedJsonExamples(page.body)) {
      const validate = schemaValidators.get(example.schemaId)
      if (!validate) {
        fail(`${name}: unknown schema contract ${example.schemaId}`)
        continue
      }
      try {
        const value = JSON.parse(example.source)
        if (!validate(value)) fail(`${name}: ${example.schemaId} errors: ${ajv.errorsText(validate.errors)}`)
      } catch (error) {
        fail(`${name}: invalid JSON for ${example.schemaId}: ${error instanceof Error ? error.message : error}`)
      }
    }
    if (page.route === '/cli/') cliPage = page
    if (page.route === '/configuration/') configurationPage = page
  }
  if (!cliPage?.body.includes('Generated from @mobench/truth')) fail('CLI reference must contain the generated truth section')
  if (!configurationPage?.body.includes('Generated from @mobench/truth')) fail('configuration reference must contain the generated truth section')
  const visitCommand = (command: CommandContract) => {
    if (command.path !== 'mobench' && !command.path.split(' ').includes('help') && !cliPage?.body.includes(`\`${command.path}\``)) {
      fail(`CLI reference is missing generated command ${command.path}`)
    }
    for (const subcommand of command.subcommands) visitCommand(subcommand)
  }
  visitCommand(manifest.command_tree)
  for (const config of manifest.config) {
    for (const key of config.keys) {
      if (!configurationPage?.body.includes(`\`${key.path}\``)) fail(`configuration reference is missing generated key ${key.path}`)
    }
  }
  for (const alias of aliasRoutes) {
    if (canonicalRoutes.has(alias)) fail(`alias ${alias} collides with a canonical route`)
  }
  for (const page of pages) validateLinks(page, canonicalRoutes, aliasRoutes)

  if (failures.length) {
    console.error(`Content contract failed with ${failures.length} issue(s):`)
    for (const issue of failures) console.error(`- ${issue}`)
    process.exit(1)
  }
  console.log(`Validated ${pages.length} docs pages, ${manifest.capabilities.length} capabilities, and the pinned ${pin.release} manifest.`)
}

await main()
