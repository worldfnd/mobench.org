# Documentation authoring

Documentation lives in `apps/docs/src/content/docs` as MDX. Prefer task-oriented prose and executable examples over feature inventories.

## Required frontmatter

Every page declares:

```yaml
---
title: First BrowserStack run
slug: first-browserstack-run
description: Build an Android runner and execute it on one hosted device.
section: Run benchmarks
order: 1
audience: [benchmark-author, ci-engineer]
release: 0.1.46
lastVerified: 2026-07-19
sourceRefs:
  - label: BrowserStack execution path
    url: https://github.com/worldcoin/mobile-bench-rs/blob/d5e00b3d10120c947b247c78303492741563ee49/crates/mobench/src/browserstack.rs
    evidence: source-browserstack-run
aliases:
  - /app-automate
draft: false
---
```

The required `slug` is the flat canonical route, independent of the authoring folder. Aliases begin with `/`, cannot collide with a canonical slug or another alias, and always redirect to a canonical page.

## Commands and claims

- Use `mobench` for stable `0.1.46` commands. Do not publish `cargo mobench` until the wrapper fix appears in the pinned release manifest and passes both invocation smokes.
- Ordinary mobile benchmark execution is a BrowserStack capability in the current release.
- `--local-only` is build/preflight behavior; it does not execute a benchmark on an attached phone, emulator, or simulator.
- Describe local profiling only where the manifest marks the exact platform/backend combination supported.
- Copy option names, defaults, artifact names, and configuration keys from the pinned upstream manifest.
- Never invent coverage percentages, energy metrics, benchmark results, or device-support claims. Link to a fixture, test, case study, or upstream source.

All `bash`, `console`, and `sh` fences containing a `mobench` command are parser-tested against the pinned command tree. Use ordinary fenced blocks:

````md
```console
mobench ci run --target android --output-dir target/mobench/ci --fetch
```
````

JSON examples that represent an upstream schema use `test=schema:<schema-id>` and are validated during `bun run check`.

TOML examples for published Mobench configuration use `test=config:mobench.toml` or `test=config:bench-config.toml`. Every tagged key must exist in the pinned manifest.

## Links and media

- Prefer canonical internal links without hostnames.
- External behavioral claims need a `sourceRefs` entry and a nearby human-readable link.
- Give meaningful images alt text, fixed dimensions, and responsive sources.
- Give every chart a table or definition list containing the same information.
- Give every diagram a visible summary that remains useful without the image.

## Copy Markdown

The Copy Markdown action returns the authored page body with headings, links, lists, and code fences intact. It must not copy navigation, analytics data, generated prompts, or hidden provider payloads. Assistant links, if present, contain only a short prompt and the canonical page URL.
