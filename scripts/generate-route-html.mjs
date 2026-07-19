import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/og-pages.json'), 'utf8'))
const baseHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')

function absoluteUrl(base, routePath) {
  return `${base}${routePath.startsWith('/') ? routePath : `/${routePath}`}`
}

function replaceAttr(html, selector, attr, value) {
  const escaped = value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  if (selector.startsWith('title')) {
    return html.replace(/<title>.*?<\/title>/, `<title>${escaped}</title>`)
  }

  if (selector.startsWith('link')) {
    return html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escaped}" />`)
  }

  const key = selector.match(/\[(name|property)="([^"]+)"\]/)
  if (!key) return html
  const [_, kind, name] = key
  const pattern = new RegExp(`<meta ${kind}="${name}" content="[^"]*" \\/>`)
  return html.replace(pattern, `<meta ${kind}="${name}" content="${escaped}" />`)
}

function pageHtml({ title, description, url, image }) {
  let html = baseHtml
  html = replaceAttr(html, 'title', 'content', title)
  html = replaceAttr(html, 'meta[name="description"]', 'content', description)
  html = replaceAttr(html, 'link[rel="canonical"]', 'href', url)
  html = replaceAttr(html, 'meta[property="og:title"]', 'content', title)
  html = replaceAttr(html, 'meta[property="og:description"]', 'content', description)
  html = replaceAttr(html, 'meta[property="og:url"]', 'content', url)
  html = replaceAttr(html, 'meta[property="og:image"]', 'content', image)
  html = replaceAttr(html, 'meta[name="twitter:title"]', 'content', title)
  html = replaceAttr(html, 'meta[name="twitter:description"]', 'content', description)
  html = replaceAttr(html, 'meta[name="twitter:image"]', 'content', image)
  return html
}

function writeRoute(routePath, target) {
  const clean = routePath.replace(/^\/+|\/+$/g, '')
  const outputDir = clean ? path.join(distDir, clean) : distDir
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, 'index.html'), pageHtml(target))
}

writeRoute('/docs', {
  title: 'mobench docs - Rust mobile benchmark documentation',
  description: data.docsRoot.description,
  url: absoluteUrl(data.site.docsUrl, '/docs'),
  image: absoluteUrl(data.site.docsUrl, data.docsRoot.image),
})

for (const page of data.docsPages) {
  const routePath = page.id === 'overview' ? '/overview' : `/${page.id}`
  writeRoute(routePath, {
    title: `${page.label} - mobench docs`,
    description: page.description,
    url: absoluteUrl(data.site.docsUrl, routePath),
    image: absoluteUrl(data.site.docsUrl, `/og/${page.id}.jpg`),
  })
}

for (const [alias, id] of Object.entries(data.aliases)) {
  if (alias === 'docs') continue
  const page = data.docsPages.find((candidate) => candidate.id === id)
  if (!page) continue
  const routePath = `/${alias}`
  writeRoute(routePath, {
    title: `${page.label} - mobench docs`,
    description: page.description,
    url: absoluteUrl(data.site.docsUrl, routePath),
    image: absoluteUrl(data.site.docsUrl, `/og/${page.id}.jpg`),
  })
}

console.log('Generated static route HTML for docs Open Graph metadata')
