const sources = import.meta.glob<string>('../content/docs/**/*.{md,mdx}', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function sourceSlug(path: string, source: string) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const configuredSlug = frontmatter?.[1]?.match(/^slug:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]?.trim()
  return configuredSlug || path.replace('../content/docs/', '').replace(/\.(md|mdx)$/, '')
}

function markdownBody(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trimStart()
}

export function getStaticPaths() {
  return Object.entries(sources).map(([path, source]) => ({
    params: { slug: sourceSlug(path, source) },
    props: { source: markdownBody(source) },
  }))
}

export function GET({ props }: { props: { source: string } }) {
  return new Response(props.source, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
