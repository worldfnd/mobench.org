# Architecture

## Boundaries

The workspace contains two independent static outputs:

| Surface | Canonical origin | Responsibility |
| --- | --- | --- |
| Marketing | `https://mobench.org` | Product story, capability summary, proof, requirements, and task entry points |
| Documentation | `https://docs.mobench.org` | Guides, search, examples, generated reference, release applicability, and troubleshooting |

The marketing application must not render documentation aliases. The documentation application must not mirror the marketing landing page. Redirects enforce the boundary at the edge.

## Truth flow

```text
mobile-bench-rs release tests
  -> mobench-site-manifest-v1.json release asset
  -> pinned manifest + checksum in packages/truth
  -> generated reference, validation, llms files, and capability copy
  -> both static Astro builds
```

The website build is offline and deterministic. A release-sync command may download an explicitly requested release into a temporary directory, validate it, and prepare a reviewable update. It must never read an unpinned upstream branch during a production build.

Capabilities use exactly four states: `supported`, `preview`, `planned`, and `unsupported`. Each entry cites an upstream test or source identifier. Authored prose may explain a capability but cannot override its state.

## Rendering

- Astro emits complete HTML, metadata, canonical URLs, structured data, navigation, highlighted code, diagrams, sitemaps, and AI-readable text.
- Starlight supplies the documentation shell and Pagefind index.
- Framework-free scripts progressively enhance theme selection, mobile controls, copy, and tabs.
- Diagrams are accessible SVG or semantic HTML with adjacent text summaries. Mermaid is never shipped to browsers.
- Media declares dimensions and responsive sources. Font files are self-hosted and subset.

## URL contract

- Documentation home: `https://docs.mobench.org/`
- Documentation page: `https://docs.mobench.org/<slug>/`
- Marketing documentation paths, `/docs`, `/overview`, and legacy documentation aliases return permanent redirects.
- Unknown paths return a branded HTTP 404 response.
- Sitemaps contain canonical URLs only.

## Analytics contract

Analytics are aggregate and non-identifying. Allowed events have fixed names and enum-like properties. Search queries, copied text, credentials, repository names, benchmark names, device IDs, and user-provided URLs are never transmitted.
