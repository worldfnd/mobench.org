import { parse as parseYaml } from 'yaml'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const docsRoot = join(root, 'apps/docs/src/content/docs')
const docsPublic = join(root, 'apps/docs/public')
const marketingPublic = join(root, 'apps/marketing/public')
const truthRoot = join(root, 'packages/truth')
const checkOnly = process.argv.includes('--check')

type Frontmatter = {
  slug: string
  title: string
  description: string
  section?: string
  order?: number
  release?: string | number
  draft?: boolean
  aliases?: string[]
  sourceRefs?: Array<{ label: string; url: string; evidence?: string }>
}
type Page = Frontmatter & { route: string; authoringRoute: string; body: string; file: string }

type Redirect = { source: string; destination: string; permanent: true }

type ManifestOption = {
  id: string
  long: string | null
  short: string | null
  positional_index: number | null
  required: boolean
  global: boolean
  hidden: boolean
  action: string
  value_names: string[]
  possible_values: string[]
  defaults: string[]
  environment: string | null
  help: string | null
}
type ManifestCommand = {
  name: string
  path: string
  about: string | null
  options: ManifestOption[]
  subcommands: ManifestCommand[]
}
type Manifest = {
  release: { version: string; tag: string; sha: string; repository: string }
  command_tree: ManifestCommand
  config: Array<{
    file: string
    keys: Array<{ path: string; value_type: string; required: boolean; default: unknown; evidence_id: string }>
  }>
  binaries: Array<{ name: string; canonical_for_release: boolean; status: string; note: string }>
}
type Pin = { version: string; release: string; commitSha: string }

const legacyAliases = new Map([
  ['/home/', '/'],
  ['/diagrams/', '/device-matrices/'],
])

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  }))).flat().sort()
}

async function loadPages(): Promise<Page[]> {
  const pages: Page[] = []
  for (const file of (await filesUnder(docsRoot)).filter((path) => /\.mdx?$/.test(path))) {
    const source = await readFile(file, 'utf8')
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
    if (!match) throw new Error(`${file} has no frontmatter`)
    const data = parseYaml(match[1]) as Frontmatter
    if (data.draft) continue
    const route = data.slug === 'index' ? '/' : `/${data.slug}/`
    const authoredSlug = relative(docsRoot, file).replaceAll('\\', '/').replace(/\.mdx?$/, '')
    const authoringRoute = authoredSlug === 'index' ? '/' : `/${authoredSlug.replace(/\/index$/, '')}/`
    pages.push({ ...data, file, route, authoringRoute, body: source.slice(match[0].length).trim() })
  }
  return pages.sort((a, b) => (a.section ?? '').localeCompare(b.section ?? '') || (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title))
}

function normalizeRoute(pathname: string) {
  return pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}/`
}

function markdownCell(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  const rendered = typeof value === 'string' ? value : JSON.stringify(value)
  return rendered
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ')
}

function commandRows(rootCommand: ManifestCommand) {
  const rows: ManifestCommand[] = []
  const visit = (command: ManifestCommand) => {
    if (command.path !== rootCommand.path && !command.path.split(' ').includes('help')) rows.push(command)
    for (const subcommand of command.subcommands) visit(subcommand)
  }
  visit(rootCommand)
  return rows
}

function flagLabel(option: ManifestOption) {
  const names = [option.short ? `\`-${option.short}\`` : '', option.long ? `\`--${option.long}\`` : ''].filter(Boolean)
  if (names.length) return names.join(', ')
  return `\`<${option.value_names[0] ?? option.id}>\``
}

function valueContract(option: ManifestOption) {
  if (option.action === 'SetTrue' || option.action === 'SetFalse') return 'boolean'
  const values = option.possible_values.length ? option.possible_values.join(' | ') : option.value_names.join(', ')
  return values ? `\`${values.replaceAll('|', '\\|')}\`` : 'boolean'
}

function generatedCliReference(manifest: Manifest) {
  const commands = commandRows(manifest.command_tree)
  const globalOptions = manifest.command_tree.options.filter((option) => !option.hidden && option.long !== 'help' && option.long !== 'version')
  const localOptions = new Map(commands.map((command) => [
    command.path,
    command.options.filter((option) => !option.hidden && !option.global && option.long !== 'help'),
  ]))
  return [
    '{/* BEGIN GENERATED CLI REFERENCE */}',
    '{/* Generated from @mobench/truth. Do not edit this section by hand. */}',
    '',
    '## Global flags',
    '',
    '| Flag | Value | Default | Purpose |',
    '| --- | --- | --- | --- |',
    ...globalOptions.map((option) => `| ${flagLabel(option)} | ${valueContract(option)} | ${markdownCell(option.defaults.join(', '))} | ${markdownCell(option.help)} |`),
    '',
    'The generated CLI also provides `--help`, `-h`, `--version`, and `-V` where Clap exposes them.',
    '',
    '## Command index',
    '',
    '| Command | Purpose |',
    '| --- | --- |',
    ...commands.map((command) => `| \`${command.path}\` | ${markdownCell(command.about)} |`),
    '',
    '## Complete command flag index',
    '',
    'Global flags above are omitted from each command row. Positional arguments use angle brackets.',
    '',
    ...commands.flatMap((command) => {
      const options = localOptions.get(command.path) ?? []
      if (!options.length) return []
      return [
        `### \`${command.path}\``,
        '',
        '| Flag or argument | Value | Requirement | Purpose |',
        '| --- | --- | --- | --- |',
        ...options.map((option) => {
          const requirement = option.required
            ? 'required'
            : option.defaults.length
              ? `default: ${markdownCell(option.defaults.join(', '))}`
              : 'optional'
          return `| ${flagLabel(option)} | ${valueContract(option)} | ${requirement} | ${markdownCell(option.help)} |`
        }),
        '',
      ]
    }),
    '',
    '{/* END GENERATED CLI REFERENCE */}',
  ].join('\n')
}

function generatedConfigReference(manifest: Manifest) {
  const lines = [
    '{/* BEGIN GENERATED CONFIG REFERENCE */}',
    '{/* Generated from @mobench/truth. Do not edit this section by hand. */}',
    '',
    '## Published configuration keys',
    '',
    'These are the complete configuration keys in the pinned release contract. Example files below may use only a task-specific subset.',
    '',
  ]
  for (const config of manifest.config) {
    lines.push(
      `### \`${config.file}\``,
      '',
      '| Key | Value | Required | Default | Evidence |',
      '| --- | --- | --- | --- | --- |',
      ...config.keys.map((key) => `| \`${key.path}\` | \`${key.value_type}\` | ${key.required ? 'yes' : 'no'} | ${markdownCell(key.default)} | \`${key.evidence_id}\` |`),
      '',
    )
  }
  lines.push('{/* END GENERATED CONFIG REFERENCE */}')
  return lines.join('\n')
}

async function syncGeneratedSection(path: string, label: string, generated: string) {
  const source = await readFile(path, 'utf8')
  const pattern = new RegExp(`\\{\\/\\* BEGIN GENERATED ${label} \\*\\/\\}[\\s\\S]*?\\{\\/\\* END GENERATED ${label} \\*\\/\\}`)
  if (!pattern.test(source)) throw new Error(`${relative(root, path)} is missing the generated ${label.toLowerCase()} markers`)
  await emit(path, source.replace(pattern, generated))
}

function vercelSource(route: string) {
  return route === '/' ? '/' : route.replace(/\/$/, '')
}

function routeAliases(pages: Page[]) {
  const aliases = new Map<string, string>(legacyAliases)
  for (const page of pages) {
    if (page.authoringRoute !== page.route) aliases.set(page.authoringRoute, page.route)
    for (const alias of page.aliases ?? []) aliases.set(normalizeRoute(alias), page.route)
  }
  return aliases
}

function redirectsForDocs(pages: Page[]): Redirect[] {
  return [...routeAliases(pages)]
    .filter(([source, destination]) => source !== destination)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([source, destination]) => ({
      source: vercelSource(source),
      destination,
      permanent: true as const,
    }))
}

function redirectsForMarketing(pages: Page[]): Redirect[] {
  const redirects = new Map<string, string>()
  redirects.set('/docs/:path*', 'https://docs.mobench.org/:path*')
  for (const page of pages) {
    if (page.route !== '/') redirects.set(vercelSource(page.route), `https://docs.mobench.org${page.route}`)
  }
  for (const [source, destination] of routeAliases(pages)) {
    redirects.set(vercelSource(source), `https://docs.mobench.org${destination}`)
  }
  return [...redirects]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([source, destination]) => ({ source, destination, permanent: true as const }))
}

function vercelConfig(surface: 'marketing' | 'docs', redirects: Redirect[]) {
  return {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    framework: 'astro',
    installCommand: 'cd ../.. && bun install --frozen-lockfile',
    buildCommand: `cd ../.. && bun run generate && bun run build:${surface}`,
    outputDirectory: 'dist',
    redirects,
    headers: [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }],
  }
}

function renderIndex(pages: Page[], manifest: Manifest, pin: Pin) {
  const canonicalBinary = manifest.binaries.find((binary) => binary.canonical_for_release)
  const cargoWrapper = manifest.binaries.find((binary) => binary.name === 'cargo-mobench')
  const lines = [
    '# mobench',
    '',
    `> Source-backed documentation for mobench ${pin.version}: build Android and iOS runners, execute ordinary benchmarks on BrowserStack devices, and analyze stable reports or supported local native profiles.`,
    '',
    'Canonical documentation: https://docs.mobench.org/',
    `Source: ${manifest.release.repository}/tree/${pin.release}`,
    `Pinned release SHA: ${pin.commitSha}`,
    '',
    '## Capability boundary',
    '',
    `- Use the \`${canonicalBinary?.name ?? 'mobench'}\` executable for release ${pin.version}.${cargoWrapper?.status === 'unsupported' ? ' The published `cargo mobench` wrapper is unsupported.' : ''}`,
    '- Ordinary mobile benchmarks execute through BrowserStack when devices are selected.',
    '- `--local-only` is host preflight and does not measure Android or iOS execution.',
    '- Local native profiling has a separate Android simpleperf and iOS simulator-host capability matrix.',
    '- The release does not define an energy or battery measurement contract.',
    '',
    '## Documentation',
    '',
  ]
  for (const page of pages) {
    lines.push(`- [${page.title}](https://docs.mobench.org${page.route}): ${page.description}`)
  }
  lines.push(
    '',
    '## Stable command entry points',
    '',
    '```bash',
    `cargo install mobench --version ${pin.version}`,
    'mobench list --crate-path bench-mobile',
    'mobench run --target android --function bench_mobile::checksum --local-only --output target/mobench/preflight.json',
    'mobench run --target android --function bench_mobile::checksum --devices "Google Pixel 7-13.0" --release --fetch --output target/mobench/results.json',
    'mobench ci run --target android --function bench_mobile::checksum --devices "Google Pixel 7-13.0" --release --fetch --output-dir target/mobench/ci',
    'mobench profile run --target android --provider local --backend android-native --function bench_mobile::checksum --output-dir target/mobench/profile',
    '```',
    '',
    'Full authored documentation: https://docs.mobench.org/llms-full.txt',
    '',
  )
  return lines.join('\n')
}

function renderFull(pages: Page[], pin: Pin) {
  return [
    '# mobench documentation — full authored text',
    '',
    `Release: ${pin.version}`,
    'Canonical origin: https://docs.mobench.org/',
    '',
    ...pages.flatMap((page) => [
      `# ${page.title}`,
      '',
      `Canonical URL: https://docs.mobench.org${page.route}`,
      `Description: ${page.description}`,
      ...(page.sourceRefs ?? []).map((source) => `Source: ${source.label} — ${source.url}${source.evidence ? ` — ${source.evidence}` : ''}`),
      '',
      page.body,
      '',
    ]),
  ].join('\n')
}

async function emit(path: string, content: string) {
  const normalized = content.endsWith('\n') ? content : `${content}\n`
  if (checkOnly) {
    let existing = ''
    try { existing = await readFile(path, 'utf8') } catch {}
    if (existing !== normalized) throw new Error(`${relative(root, path)} is stale; run bun run generate`)
    return
  }
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, normalized)
}

const manifest = JSON.parse(await readFile(join(truthRoot, 'mobench-site-manifest-v1.json'), 'utf8')) as Manifest
const pin = JSON.parse(await readFile(join(truthRoot, 'pin.json'), 'utf8')) as Pin
await syncGeneratedSection(
  join(docsRoot, 'reference/cli.mdx'),
  'CLI REFERENCE',
  generatedCliReference(manifest),
)
await syncGeneratedSection(
  join(docsRoot, 'reference/configuration.mdx'),
  'CONFIG REFERENCE',
  generatedConfigReference(manifest),
)
const pages = await loadPages()
const index = renderIndex(pages, manifest, pin)
await emit(join(docsPublic, 'llms.txt'), index)
await emit(join(marketingPublic, 'llms.txt'), index)
await emit(join(docsPublic, 'llms-full.txt'), renderFull(pages, pin))
for (const schema of ['summary-v1.schema.json', 'ci-contract-v1.schema.json', 'trace-events-v1.schema.json', 'mobench-site-manifest-v1.schema.json']) {
  await emit(join(docsPublic, 'schemas', schema), await readFile(join(truthRoot, 'schemas', schema), 'utf8'))
}
await emit(join(docsPublic, 'manifests', 'mobench-site-manifest-v1.json'), await readFile(join(truthRoot, 'mobench-site-manifest-v1.json'), 'utf8'))
for (const fixture of ['summary-basic.json', 'summary-ffi.json']) {
  await emit(join(docsPublic, 'fixtures', fixture), await readFile(join(truthRoot, 'fixtures', fixture), 'utf8'))
}
await emit(
  join(root, 'apps/marketing/vercel.json'),
  JSON.stringify(vercelConfig('marketing', redirectsForMarketing(pages)), null, 2),
)
await emit(
  join(root, 'apps/docs/vercel.json'),
  JSON.stringify(vercelConfig('docs', redirectsForDocs(pages)), null, 2),
)
console.log(`${checkOnly ? 'Checked' : 'Generated'} llms, truth assets, and redirect contracts from ${pages.length} authored pages.`)
