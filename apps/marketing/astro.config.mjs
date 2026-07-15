import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://mobench.org',
  output: 'static',
  integrations: [sitemap()],
  build: { format: 'directory' },
  compressHTML: true,
})
