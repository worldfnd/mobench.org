# Pinned mobench truth

This package is the offline input for both website builds. It pins upstream release `v0.1.43` at commit `d1a3176f9144f35e777e83fd07045116144da257` and the exact SHA-256 checksum of `mobench-site-manifest-v1.json`.

Do not edit the manifest, schemas, or fixtures by hand. Regenerate them from a tagged `mobile-bench-rs` release, verify their checksums, and update them through the release-sync workflow documented in `docs/RELEASE_SYNC.md`.

The canonical executable and Cargo-wrapper status come from the pinned manifest. Generated website commands must keep using the canonical supported binary until a later release changes that contract and the invocation smokes pass.
