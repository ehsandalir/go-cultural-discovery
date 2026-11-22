# GO Portability & Recovery Acceptance Gate

Status: DRAFT — non-executable governance and testing document.
Ownership: GO co-founders. This document does not authorize production changes.

## Source of truth
- Treat the currently approved and deployed GO Sites project as product baseline until a separately verified source export is available.
- The GitHub repository is **not** a verified complete copy of the current Sites code. Do not deploy its application snapshot as a replacement without comparing full source trees and behavior.
- Preserve original source history, original environment and all production data. No force-push, destructive schema migration, automated data reset or forced cutover.

## Target logical modules
1. GO Core: frontend, business rules, Vibe, Discovery, GoStudio.
2. GO Users: identities, rooms, profiles, subscriptions, roles.
3. GO Catalog: works, creators, editions, six indices, localization.
4. GO Music: track metadata, signed stream access, entitlement and play history.
5. GO Room Assets: base images, overlays, theme mapping and asset manifests.
6. GO Infrastructure: deployment, domain, backups, secrets and monitoring.

Git repositories hold source and infrastructure-as-code; private operational user data and large media belong in databases/object storage with independent backups.

## Release and migration gate — all required
- [ ] Obtain the actual current Sites source/export and immutable version/commit ID.
- [ ] Compare exported application files against GitHub and produce a complete discrepancy manifest.
- [ ] Record all runtime dependencies, APIs, OAuth callbacks, third-party integrations and environment variable names **without** committing secret values.
- [ ] Export full PostgreSQL schemas, functions, RLS/policies, migrations, and required application data with verified timestamps.
- [ ] Export Supabase Auth identities and configuration through authorized migration methods; test password/OAuth/session behavior in a sandbox.
- [ ] Inventory and export every external image, room asset, cover, audio file, and any storage not resident in Supabase.
- [ ] Verify an off-platform backup, per-file checksums, encryption, retention, and recovery keys controlled by the co-founders.
- [ ] Restore into a **separate** development environment; run smoke and integrity tests; check user and work counts and relationships.
- [ ] Validate key end-to-end flows: FA/EN, signup/login, room, explore, owned/wanted, vibes, discovery, music limits, admin and payments.
- [ ] Rehearse domain, HTTPS, provider allowlists, email and OAuth redirects, payment callbacks, rollback and DNS change procedure.
- [ ] Co-founders review the restore evidence and approve the production cutover.
- [ ] Retain a working rollback image and backup until final sign-off.

## Safety rules for agents
- Discovery/read-only analysis first. Branch/PR changes by default; production deployments require explicit approval.
- Never use production credentials in chat, source code, logs or PRs.
- No destructive mutation unless a verified, **independently stored** backup exists, a restore rehearsal passes, and the co-founders approve the action.
- Store privileged credentials in a dedicated secret manager; use least-privilege, auditable access.
- Do not confuse a backup table/manifest with a tested full-system restore.
- A successful build or HTTP 200 response is not a proof of functional parity or successful backup.

## Evidence pack required before declaring GO portable
A release manifest containing the exact Sites version, Git SHA(s), DB dump snapshot, media inventory and hashes, restore logs, smoke-test results, known exceptions, and rollback procedure. Keep this evidence in private controlled storage.
