import { describe, expect, test } from 'bun:test'
import { gzipSync } from 'node:zlib'
import { existsSync } from 'node:fs'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const marketingDist = join(root, 'apps/marketing/dist')
const docsDist = join(root, 'apps/docs/dist')
const pin = await json(join(root, 'packages/truth/pin.json'))
const manifest = await json(join(root, 'packages/truth/mobench-site-manifest-v1.json'))
const docSlugs = [
  'basic-example', 'benchmark-functions', 'benchmark-quality', 'browserstack', 'ci', 'cli',
  'compatibility', 'configuration', 'device-matrices', 'ffi-example', 'host-preflight',
  'installation', 'outputs', 'profiling', 'quickstart', 'regressions', 'schemas',
  'setup-teardown', 'troubleshooting',
]

async function text(path: string) { return readFile(path, 'utf8') }
async function json(path: string) { return JSON.parse(await text(path)) }

function meta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["']`, 'i'))?.[1]
}

describe('static delivery contract', () => {
  test('marketing HTML is complete and source-backed', async () => {
    const html = await text(join(marketingDist, 'index.html'))
    expect(html).toContain('<main id="main-content">')
    expect(html).toContain('BrowserStack App Automate')
    expect(html).toContain('Fixture data')
    expect(html).toContain('Pin the toolchain. Choose the native bridge.')
    expect(html).toContain('https://mobench.org/')
    expect(meta(html, 'og:image:alt')).toBeTruthy()
    expect(html).toContain('application/ld+json')
    for (const capability of [
      'benchmark.build.android',
      'benchmark.build.ios',
      'benchmark.execute.browserstack.android',
      'benchmark.execute.browserstack.ios',
      'benchmark.execute.local-only',
      'benchmark.execute.attached-device',
      'benchmark.execute.android-emulator',
      'benchmark.execute.ios-simulator',
      'profile.local.android-native',
      'profile.local.ios-instruments',
    ]) expect(html).toContain(capability)
    expect(html).not.toMatch(/<code[^>]*>\s*cargo mobench|cargo mobench (?:init|run|ci|profile|build)/)
    expect(html).not.toMatch(/(?:runs?|exercises?) (?:only )?the host harness/i)
    expect(html).not.toContain('mermaid')
  })

  test('every canonical docs route has unique server-rendered metadata', async () => {
    const titles = new Set<string>()
    const descriptions = new Set<string>()
    for (const slug of docSlugs) {
      const html = await text(join(docsDist, slug, 'index.html'))
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
      const description = meta(html, 'description')
      expect(title).toBeTruthy()
      expect(description).toBeTruthy()
      expect(titles.has(title!)).toBe(false)
      expect(descriptions.has(description!)).toBe(false)
      titles.add(title!)
      descriptions.add(description!)
      expect(html).toContain(`rel="canonical" href="https://docs.mobench.org/${slug}/"`)
      expect(html).toContain('"@type":"TechArticle"')
      expect(html).toContain('"@type":"BreadcrumbList"')
      expect(meta(html, 'og:image')).toBe(`https://docs.mobench.org/og/${slug}.png`)
      expect(meta(html, 'og:image:alt')).toBeTruthy()
      expect(html).not.toContain('cargo mobench')
      expect(html).not.toContain('apps/docs/src/content/docs/src/content/docs')
    }
  })

  test('canonical-only sitemaps and real 404 files are emitted', async () => {
    const docsSitemap = await text(join(docsDist, 'sitemap-0.xml'))
    const marketingSitemap = await text(join(marketingDist, 'sitemap-0.xml'))
    for (const slug of docSlugs) expect(docsSitemap).toContain(`<loc>https://docs.mobench.org/${slug}/</loc>`)
    expect(docsSitemap).not.toContain('/get-started/')
    expect(docsSitemap).not.toContain('.md</loc>')
    expect(marketingSitemap).toContain('<loc>https://mobench.org/</loc>')
    expect(marketingSitemap).not.toContain('docs.mobench.org')
    expect(await text(join(docsDist, '404.html'))).toContain('Page not found')
    expect(await text(join(marketingDist, '404.html'))).toContain('Page not found')
  })

  test('robots, llms, schemas, source Markdown, and manifest are static', async () => {
    expect(await text(join(marketingDist, 'robots.txt'))).toContain('Sitemap: https://mobench.org/sitemap-index.xml')
    expect(await text(join(docsDist, 'robots.txt'))).toContain('Sitemap: https://docs.mobench.org/sitemap-index.xml')
    const llms = await text(join(docsDist, 'llms.txt'))
    expect(llms).toContain(`Pinned release SHA: ${pin.commitSha}`)
    expect(llms).not.toMatch(/cargo mobench (?:init|run|ci|profile|build)/)
    expect(await text(join(docsDist, 'quickstart.md'))).toContain('# 1. Register a benchmark')
    expect(JSON.parse(await text(join(docsDist, 'manifests/mobench-site-manifest-v1.json'))).release.version).toBe(pin.version)
    expect(JSON.parse(await text(join(docsDist, 'schemas/summary-v1.schema.json'))).$schema).toBeTruthy()
  })

  test('generated Vercel routing keeps one canonical docs surface', async () => {
    const marketingConfig = await json(join(root, 'apps/marketing/vercel.json'))
    const docsConfig = await json(join(root, 'apps/docs/vercel.json'))
    const marketingRedirects = new Map(marketingConfig.redirects.map((item: { source: string; destination: string; permanent: boolean }) => [item.source, item]))
    const docsRedirects = new Map(docsConfig.redirects.map((item: { source: string; destination: string; permanent: boolean }) => [item.source, item]))

    for (const slug of docSlugs) {
      expect(marketingRedirects.get(`/${slug}`)?.destination).toBe(`https://docs.mobench.org/${slug}/`)
    }
    expect(marketingRedirects.get('/docs/:path*')?.destination).toBe('https://docs.mobench.org/:path*')
    expect(docsRedirects.get('/get-started/quickstart')?.destination).toBe('/quickstart/')
    expect(docsRedirects.get('/concepts')?.destination).toBe('/configuration/')
    expect(docsRedirects.get('/diagrams')?.destination).toBe('/device-matrices/')
    expect(docsRedirects.get('/home')?.destination).toBe('/')
    for (const item of [...marketingRedirects.values(), ...docsRedirects.values()]) expect(item.permanent).toBe(true)
    expect(existsSync(join(root, 'vercel.json'))).toBe(false)
  })

  test('analytics uses fixed property-free events', async () => {
    const config = await text(join(root, 'packages/site-config/src/index.ts'))
    const marketingAnalytics = await text(join(root, 'apps/marketing/src/scripts/analytics.ts'))
    const docsAnalytics = await text(join(root, 'apps/docs/src/scripts/analytics.ts'))
    for (const event of ['quickstart_opened', 'install_copied', 'github_opened', 'search_result_opened', 'search_zero_results']) {
      expect(config).toContain(`'${event}'`)
    }
    expect(marketingAnalytics).toContain('track(name as AnalyticsEvent)')
    expect(docsAnalytics).toContain('track(name)')
    expect(marketingAnalytics).not.toMatch(/track\([^)]*,/)
    expect(docsAnalytics).not.toMatch(/track\([^)]*,/)
  })

  test('reference HTML and Markdown are generated from the pinned truth manifest', async () => {
    const cliHtml = await text(join(docsDist, 'cli/index.html'))
    const cliMarkdown = await text(join(docsDist, 'cli.md'))
    const configurationHtml = await text(join(docsDist, 'configuration/index.html'))
    const configurationMarkdown = await text(join(docsDist, 'configuration.md'))
    const ciMarkdown = await text(join(docsDist, 'ci.md'))

    for (const command of ['mobench run', 'mobench ci run', 'mobench ci prepare', 'mobench ci run-prebuilt', 'mobench ci merge-split-runs', 'mobench profile run']) {
      expect(cliHtml).toContain(command)
      expect(cliMarkdown).toContain(`\`${command}\``)
    }
    for (const config of manifest.config) {
      for (const key of config.keys) {
        expect(configurationHtml).toContain(key.path)
        expect(configurationMarkdown).toContain(`\`${key.path}\``)
      }
    }
    expect(cliMarkdown).toContain('Generated from @mobench/truth')
    expect(configurationMarkdown).toContain('Generated from @mobench/truth')
    for (const releaseContract of ['prepare_script', 'functions_ios', 'android_devices', 'rust_toolchain', 'ffi_backend', 'exactly one result shard']) {
      expect(ciMarkdown).toContain(releaseContract)
    }
    expect(ciMarkdown).toContain('1ac54adaf2bd97c6ca303705e1e0471257716f48')
    expect(cliMarkdown).toContain('--ffi-backend')
    expect(configurationMarkdown).toContain('project.ffi_backend')
  })

  test('release sync is explicit and watcher updates through a pull-request branch', async () => {
    const packageJson = await text(join(root, 'package.json'))
    const syncScript = await text(join(root, 'scripts/sync-release.ts'))
    const workflow = await text(join(root, '.github/workflows/release-sync.yml'))
    expect(packageJson).toContain('"sync:release"')
    expect(syncScript).toContain('--expected-manifest-sha256')
    expect(syncScript).toContain('/git/ref/tags/')
    expect(syncScript).not.toContain('/heads/main')
    expect(workflow).toContain('schedule:')
    expect(workflow).toContain('gh pr create')
    expect(workflow).not.toMatch(/git push[^\n]*(?:main|master)/)
  })
})

describe('performance budgets', () => {
  test('hero variants stay below 250 kB', async () => {
    const files = await readdir(join(root, 'apps/marketing/public/hero'))
    for (const file of files) expect((await stat(join(root, 'apps/marketing/public/hero', file))).size).toBeLessThanOrEqual(250 * 1024)
  })

  test('initial JavaScript stays within surface budgets', async () => {
    for (const [dist, htmlFile, budget] of [
      [marketingDist, 'index.html', 40 * 1024],
      [docsDist, 'quickstart/index.html', 75 * 1024],
    ] as const) {
      const html = await text(join(dist, htmlFile))
      const scripts = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1])
      const unique = [...new Set(scripts)]
      let bytes = 0
      for (const source of unique) bytes += gzipSync(await readFile(join(dist, source.replace(/^\//, '')))).byteLength
      expect(bytes).toBeLessThanOrEqual(budget)
    }
  })

  test('no React or Mermaid runtime ships', async () => {
    const assetNames = [...await readdir(join(marketingDist, '_astro')), ...await readdir(join(docsDist, '_astro'))].join('\n').toLowerCase()
    expect(assetNames).not.toContain('mermaid')
    expect(assetNames).not.toContain('react')
  })

  test('only the Latin Geist subsets are emitted', async () => {
    for (const dist of [marketingDist, docsDist]) {
      expect((await readdir(join(dist, 'fonts'))).sort()).toEqual([
        'geist-latin-wght-normal.woff2',
        'geist-mono-latin-wght-normal.woff2',
      ])
    }
  })
})
