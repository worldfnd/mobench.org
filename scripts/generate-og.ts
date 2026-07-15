import sharp from 'sharp'
import { parse as parseYaml } from 'yaml'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import pin from '@mobench/truth/pin'

const root = resolve(import.meta.dir, '..')
const docsRoot = join(root, 'apps/docs/src/content/docs')
const checkOnly = process.argv.includes('--check')

type Page = { title: string; description: string; section?: string; slug: string; release: string | number; draft?: boolean }

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  }))).flat().sort()
}

function escapeXml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function wrapTitle(title: string, max = 26) {
  const lines: string[] = []
  let line = ''
  for (const word of title.split(/\s+/)) {
    if (line && `${line} ${word}`.length > max) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

function artwork(page: Page) {
  const title = wrapTitle(page.title)
  const titleLines = title.map((line, index) => `<tspan x="92" dy="${index === 0 ? 0 : 76}">${escapeXml(line)}</tspan>`).join('')
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#11160f"/>
      <path d="M0 512 C240 456 405 590 646 504 S1010 404 1200 485 V630 H0Z" fill="#1c2918"/>
      <g opacity=".12" stroke="#f5efdd"><path d="M0 80H1200M0 160H1200M0 240H1200M0 320H1200M0 400H1200M0 480H1200M0 560H1200"/><path d="M80 0V630M160 0V630M240 0V630M320 0V630M400 0V630M480 0V630M560 0V630M640 0V630M720 0V630M800 0V630M880 0V630M960 0V630M1040 0V630M1120 0V630"/></g>
      <rect x="78" y="66" width="54" height="54" rx="13" fill="#9bd17e"/>
      <text x="105" y="104" text-anchor="middle" fill="#11160f" font-family="ui-monospace, monospace" font-size="31" font-weight="750">m</text>
      <text x="150" y="102" fill="#f5efdd" font-family="ui-sans-serif, sans-serif" font-size="31" font-weight="650" letter-spacing="-1">mobench docs</text>
      <rect x="956" y="68" width="154" height="42" rx="6" fill="none" stroke="#5d7252"/>
      <text x="1033" y="96" text-anchor="middle" fill="#9bd17e" font-family="ui-monospace, monospace" font-size="18">v${escapeXml(String(page.release))}</text>
      <text x="92" y="228" fill="#9bd17e" font-family="ui-monospace, monospace" font-size="18" letter-spacing="3">${escapeXml((page.section ?? 'DOCUMENTATION').toUpperCase())}</text>
      <text x="92" y="315" fill="#f5efdd" font-family="ui-sans-serif, sans-serif" font-size="66" font-weight="690" letter-spacing="-3">${titleLines}</text>
      <path d="M934 208h176v272H934z" fill="#182116" stroke="#76976a" stroke-width="2"/>
      <rect x="956" y="232" width="132" height="220" rx="24" fill="#263e20" stroke="#9bd17e" stroke-width="3"/>
      <rect x="975" y="274" width="94" height="118" rx="8" fill="#11160f"/>
      <text x="1022" y="315" text-anchor="middle" fill="#9bd17e" font-family="ui-monospace, monospace" font-size="12">MOBILE RUNNER</text>
      <text x="1022" y="357" text-anchor="middle" fill="#f5efdd" font-family="ui-monospace, monospace" font-size="28">RUST</text>
      <circle cx="1022" cy="424" r="8" fill="#9bd17e"/>
      <text x="92" y="572" fill="#a79e8b" font-family="ui-monospace, monospace" font-size="18">docs.mobench.org/${page.slug === 'index' ? '' : escapeXml(page.slug)}</text>
    </svg>`
}

async function emit(path: string, output: Buffer) {
  if (checkOnly) {
    let existing: Buffer | undefined
    try { existing = await readFile(path) } catch {}
    if (!existing?.equals(output)) throw new Error(`${relative(root, path)} is stale; run bun run generate`)
  } else {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, output)
  }
}

const pages: Page[] = []
for (const file of (await filesUnder(docsRoot)).filter((path) => /\.mdx?$/.test(path))) {
  const source = await readFile(file, 'utf8')
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  if (!frontmatter) throw new Error(`${file} has no frontmatter`)
  const page = parseYaml(frontmatter[1]) as Page
  if (!page.draft) pages.push(page)
}
for (const page of pages) {
  const png = await sharp(Buffer.from(artwork(page))).png({ compressionLevel: 9, palette: true }).toBuffer()
  await emit(join(root, 'apps/docs/public/og', `${page.slug}.png`), png)
}
const landing: Page = { title: 'Rust benchmarks, measured on mobile.', description: '', section: 'mobench', slug: 'landing', release: pin.version }
await emit(join(root, 'apps/marketing/public/og/landing.png'), await sharp(Buffer.from(artwork(landing))).png({ compressionLevel: 9, palette: true }).toBuffer())
console.log(`${checkOnly ? 'Checked' : 'Generated'} ${pages.length + 1} responsive social images.`)
