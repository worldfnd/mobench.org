# Upstream release sync

The site follows the latest stable mobench release. It does not consume `mobile-bench-rs/main` during builds.

## Inputs

A release update requires:

1. A signed or otherwise verified upstream tag and commit SHA.
2. `mobench-site-manifest-v1.json` from that release.
3. The manifest SHA-256 checksum.
4. Referenced JSON schemas and deterministic fixtures.
5. Successful direct-executable and Cargo-wrapper smoke results recorded by upstream.

## Update flow

1. Download the manifest checksum asset from the upstream release, then run the sync command with an explicit tag and expected checksum:

   ```bash
   gh release download vX.Y.Z \
     --repo worldcoin/mobile-bench-rs \
     --pattern 'mobench-site-manifest-v1.json.sha256' \
     --dir /tmp/mobench-release
   bun run sync:release -- \
     --tag vX.Y.Z \
     --expected-manifest-sha256 "$(awk '{print $1}' /tmp/mobench-release/mobench-site-manifest-v1.json.sha256)"
   ```

   The command resolves the tag object to its commit, requires the manifest release identity to match, fetches schemas and fixtures from that immutable commit, validates their checksums and JSON contracts, and updates the offline truth package. It never fetches `main`.

2. Review manifest and schema diffs. Capability changes require source evidence.
3. Run `bun install`, then `bun run generate` to rebuild the generated CLI/configuration references, Pagefind inputs, sitemaps, OG inputs, `llms.txt`, and `llms-full.txt`.
4. Run command parsing, schema validation, content, type, unit, E2E, accessibility, visual, HTTP, and performance checks.
5. Open a pull request showing the old/new release, commit SHA, checksum, capability changes, route changes, and screenshots.
6. Merge only after both preview deployments pass smoke checks.

The scheduled `.github/workflows/release-sync.yml` watcher performs the same checksum-gated sync and opens an `automation/mobench-release-*` pull request. It never commits directly to the default branch and cannot silently relax a capability state because content validation rechecks every evidence identifier, command, configuration key, schema, and fixture.

## Cargo wrapper rule

`cargo mobench` becomes publishable only when the pinned manifest reports it supported and upstream tests prove that Cargo's injected leading `mobench` argument is removed while direct `mobench` invocation remains unchanged. Until then, generated examples use `mobench`.
