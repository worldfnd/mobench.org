# Pinned mobench truth

This package is the offline input for both website builds. It pins upstream release `v0.1.46` at commit `d5e00b3d10120c947b247c78303492741563ee49` and the exact SHA-256 checksum of `mobench-site-manifest-v1.json`.

Do not edit the manifest, schemas, or fixtures by hand. Regenerate them from a tagged `mobile-bench-rs` release, verify their checksums, and update them through the release-sync workflow documented in `docs/RELEASE_SYNC.md`.

The upstream `v0.1.46` GitHub release omitted the manifest and checksum assets expected by that workflow. This snapshot was reconstructed from the annotated tag resolving to a verified commit, tagged command definitions and help output, unchanged tagged schemas and fixtures, and upstream release validation evidence. Its checksum protects offline integrity; it is not an upstream-published checksum.

The canonical executable and Cargo-wrapper status come from the pinned manifest. Generated website commands must keep using the canonical supported binary until a later release changes that contract and the invocation smokes pass.
