# GO admin work checkpoint — 20 November 2026

**Incomplete work. Not a release or a complete Sites source backup. Do not deploy this branch.**

## Source and live state
- Official Sites project: appgprj_6ae46c0e73a481919fd6d2ce88f83d1e.
- Verified live version: 111; actual Sites source: 2a5b17fb0aca97efad362bdeb9b2aa67f9b20347.
- Live deployment: appgdep_6b008bd22e448191a162dd9139305a77; succeeded; active runtime environment revision 5.
- Existing audience remains custom. No Site version was saved or deployed in this task.
- Native Sites Git source is different from this repository's historical main. The main README still describes an old Lovable snapshot.
- Actual working checkout: /workspace/scratch/7f7b24552de3/go/.sites-checkout.
- That environment failed with: timed out recovering environment readiness from ERS. Its uncommitted files cannot currently be inspected or pushed. Do not assume their persistence or loss; inspect them after access returns.
- GitHub issues #13, #14 and #15 stay open.

## Latest owner clarification
All playable audio files are hosted on an external server. GoStudio attaches a direct external URL to each existing canonical work. Remove the old upload/Vault/library-sync/SoundCloud playback paths, keeping one GO player and one external-link path. Do not create or copy an internal audio archive. Backups retain audio metadata and URLs, not external MP3 bytes.

## Database work applied to GO Supabase
Project: vgsiupsadiakvywlezce.
Additive member_limits, limit_audit, music_daily_works and music_server_entitlements tables and server-checked RPCs were created. Streaming refresh checks were added. The empty-record default for member limits was corrected.
Public legacy music entrypoints were restored to their original behavior after the execution failure, pending the actual Sites release. go_my_member_state preserves its original response shape.
All manual QA writes were rolled back. No real account limit, role, room number, collection, or history was intentionally changed by testing.
See applied_sql/ for the exact saved SQL inputs, including compatibility restoration. Do not blindly reapply already applied CREATE statements.

## Pending runtime configuration
A new Sites environment revision 6 was staged but **not deployed**:
- GO_BACKUP_KEY and GO_MUSIC_STREAM_KEY were added as secrets.
- GO_MUSIC_VAULT_KEY, GO_MUSIC_VAULT_ORIGIN and GO_MUSIC_VAULT_SERVICE_TOKEN were removed from the pending configuration at the owner's request to retire that path.
- The active v111 deployment still uses revision 5. Any subsequent deployment uses the current pending configuration: coordinate the source cleanup with it.
No secret values are stored in this checkpoint. The unused new backup key has not been seeded into any backup service table. If continuation requires a known operator key, rotate the unused key before publishing the new feature, and seed only its hash in PostgreSQL.

## Local work before environment failure
The actual Sites checkout had in-progress implementations for:
1. Per-user music/Box/download limits, default inheritance, revision guards and audit display.
2. Unified server music authorization with signed external-source streaming.
3. Main Hall add/edit/publish/reject/archive/restore, six indices, preserved 24 work-Vibe categories, retained member references and CSV preview.
4. Encrypted split backup export, multipart jobs, upload/validation and safe merge recovery.
5. Removal of the old archive screen, upload/sync endpoints, SoundCloud source resolver and provider iframe from active code.

These are **not complete or release-verified**. Some newer draft UI/helper files were prepared after the environment became inaccessible; those recoverable texts are preserved here as .draft.txt files. They must be reconciled with the actual Sites checkout, not copied into this historical application wholesale.

## Verification and remaining failures
- Live PostgreSQL transaction tests passed for cap 10, rejection of track 11, free replay, Unlimited, zero cap, inherited 5, preserved counts, mandatory reduction confirmation, protected admin Unlimited, and non-admin editor read/write denial.
- These transactions ended in ROLLBACK.
- A local intermediate targeted run passed 42 tests and failed 6. Failures involved old API mocks, a cleared-assessment fallback and missing new UI fixture fields. Some were edited afterwards, but were not rerun.
- Intermediate typecheck passed before the final external-only cleanup. The last typecheck had a cursor optional-property error and references in obsolete tests to retired source modules. The cursor was subsequently edited; final checks did not run.
- No final build, packaged archive, authenticated browser/audio test, real-device test, backup restore test, destination upload, automatic backup schedule, or email delivery was completed.

## Required continuation
1. Recover/open the exact Sites checkout above. If unavailable, reopen the official v111 Sites source, never this old main.
2. Inspect actual edits and reconcile the text drafts. Complete cleanup of obsolete tests/imports and the external-only source transfer.
3. Implement/validate the one-time transfer of existing external track URLs to go_music_direct_links; preserve canonical work IDs and historical distinct-play counts using aliases. Retire the old public library RPCs only after the new Site is live.
4. Complete the backup service/schema, protected background runner, schedule and destination/email configuration. No cron or notification was created in this task.
5. Fix transactional restore ordering, protected ledgers, source-file recovery and failure/retry handling before claiming full project recovery. The current backup draft only proposes merge recovery and explicitly does not implement in-panel code redeployment; that is short of the owner's full restoration request.
6. Run appropriate quota, authorization, catalog, CSV, backup codec and restore tests; typecheck and build. Preserve member data, roles, room 1/2, work taxonomy and audience.
7. Use the Sites source helper to push/package the actual verified source, then save and deploy through native Sites tools. Only close #13/#14/#15 after corresponding acceptance evidence exists.
