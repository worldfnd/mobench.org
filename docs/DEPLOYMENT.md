# Deployment and smoke checks

## Vercel projects

Configure two projects from the same repository:

| Project | Root directory | Production domain |
| --- | --- | --- |
| Marketing | `apps/marketing` | `mobench.org` |
| Documentation | `apps/docs` | `docs.mobench.org` |

Both projects use Bun and static Astro output. Preserve the previous successful deployment until the live smoke passes.

## Preview gate

- Run the complete Bun validation suite from the repository root.
- Confirm full HTML, unique metadata, canonical tags, `og:image:alt`, structured data, and navigation with JavaScript disabled.
- Exercise keyboard navigation, Pagefind search, copy success/failure, theme controls, mobile drawers, hashes, and browser history at 375, 768, 1024, 1280, and 1440 pixels.
- Run axe and screen-reader smoke checks; verify visible focus, focus restoration, reduced motion, target sizes, 200%/400% zoom, and semantic chart/diagram alternatives.
- Inspect responsive screenshots for the landing page, documentation home, search, a long reference page, both 404s, and both themes.
- Enforce initial JavaScript and hero budgets from the root test configuration.

## HTTP smoke

- Canonical marketing and documentation pages return `200` with complete HTML.
- Cross-host duplicates and legacy aliases return `308` to their one canonical URL.
- Unknown paths return `404` and use the matching surface's metadata.
- `robots.txt` is plain text and each sitemap is valid canonical-only XML.
- Hydration or progressive enhancement does not change titles, descriptions, canonicals, or structured data.

## Live check and rollback

Repeat the HTTP and critical browser smokes on both production domains. Roll back if canonical routing, Quickstart, search, copy, mobile navigation, or error status behavior regresses. After launch, monitor Core Web Vitals, 404s, redirect failures, search zero-result counts, and aggregate Quickstart exits without collecting raw query text or personal data.
