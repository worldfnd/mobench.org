import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'

const repository = 'https://github.com/worldcoin/mobile-bench-rs'

export default defineConfig({
  site: 'https://docs.mobench.org',
  output: 'static',
  integrations: [
    starlight({
      title: 'mobench docs',
      disable404Route: true,
      description: 'Build, run, and analyze Rust benchmarks on mobile targets.',
      favicon: '/favicon.svg',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'mobench',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: repository },
      ],
      editLink: {
        baseUrl: 'https://github.com/worldfnd/mobench.org/edit/main/apps/docs/',
      },
      lastUpdated: true,
      customCss: ['./src/styles/mobench.css'],
      components: {
        Head: './src/components/Head.astro',
        PageTitle: './src/components/PageTitle.astro',
      },
      sidebar: [
        { label: 'Get started', items: [
          { label: 'Installation', slug: 'installation' },
          { label: 'Quickstart', slug: 'quickstart' },
        ] },
        { label: 'Write benchmarks', items: [
          { label: 'Benchmark functions', slug: 'benchmark-functions' },
          { label: 'Setup and teardown', slug: 'setup-teardown' },
          { label: 'Benchmark quality', slug: 'benchmark-quality' },
        ] },
        { label: 'Run benchmarks', items: [
          { label: 'Host-side preflight', slug: 'host-preflight' },
          { label: 'BrowserStack devices', slug: 'browserstack' },
          { label: 'CI runs', slug: 'ci' },
        ] },
        { label: 'Analyze results', items: [
          { label: 'Outputs and metrics', slug: 'outputs' },
          { label: 'Regression comparison', slug: 'regressions' },
          { label: 'Local native profiling', slug: 'profiling' },
        ] },
        { label: 'Reference', items: [
          { label: 'CLI', slug: 'cli' },
          { label: 'Configuration', slug: 'configuration' },
          { label: 'Device matrices', slug: 'device-matrices' },
          { label: 'Output schemas', slug: 'schemas' },
          { label: 'Compatibility', slug: 'compatibility' },
        ] },
        { label: 'Examples', items: [
          { label: 'Basic benchmark', slug: 'basic-example' },
          { label: 'FFI benchmark', slug: 'ffi-example' },
        ] },
        { label: 'Help', items: [
          { label: 'Troubleshooting', slug: 'troubleshooting' },
        ] },
      ],
      head: [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: 'mobench',
            codeRepository: repository,
            programmingLanguage: 'Rust',
            runtimePlatform: ['Android', 'iOS'],
          }),
        },
      ],
    }),
    sitemap(),
  ],
  build: { format: 'directory' },
  compressHTML: true,
})
