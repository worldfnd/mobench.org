# mobench.org

Marketing site and documentation for **mobench** (`mobile-bench-rs`) — an open-source Rust
benchmarking harness that runs your benchmarks on real iOS and Android phones and reports
wall-clock time, peak memory, and energy. Built by [World](https://world.org).

## Stack

- [TanStack Router](https://tanstack.com/router) (file-based routing, SPA)
- [Vite](https://vite.dev) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) primitives (Button, Accordion)

## Routes

| Path    | Source                  | Description                                              |
| ------- | ----------------------- | ------------------------------------------------------- |
| `/`     | `src/routes/index.tsx`  | Landing page — hero, features, benchmarks, FAQ, CTA.    |
| `/docs` | `src/routes/docs.tsx`   | Documentation app — sidebar nav, 8 pages, right-rail TOC. |

Both pages were imported from the Claude Design project *Mobile Bench landing page design*
(`Mobench Landing.dc.html`, `Mobench Docs.dc.html`) and reimplemented as React.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build    # outputs to dist/
npm run serve    # preview the production build
```

## Deploy

Configured for [Vercel](https://vercel.com) (`vercel.json`): framework preset `vite`, SPA
rewrites so client-side routes resolve to `index.html`.
