# GO source migration

Source project: https://lovable.dev/projects/e3f74c39-baf4-4075-9ccf-b860f5fc3987

Source snapshot: `e657cb55e435e340b72391686887ce2cc130ab0b`.

## Transfer completed

All 115 source/configuration/assets files from this snapshot are included except `.env`: 112 text files and the three original binary assets. The original binary files were downloaded through the authenticated Lovable file viewer without re-encoding or replacing them.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `public/favicon.ico` | 20373 | `dd821076a9b03adc2173c93956226aea3d92482d7578fc4339c5d3a2e9c24586` |
| `src/assets/go-room.jpg` | 243818 | `204b317eb759176aae6c25ff88d559b7ba92fe468eae98b357d8d2b75da405a9` |
| `src/assets/hero.jpg` | 126390 | `6f10c38002ac786aa91b594e44d3867fff557d049ceccf0d8da72d77bd1baace` |

`.env.example` lists configuration variable names only. `.gitignore` excludes `.env` and local environment variants. No credentials or database records were exported.

## Minimal fixes

Existing strict TypeScript errors were repaired in `auth.tsx`, `discover.tsx`, `reset-password.tsx` and `_authenticated/profile.tsx`: bracket access for index signatures, omitted optional search values/props rather than explicit undefined, and consistent void returns from form handlers. Compiler checks were not weakened; product features and styling were not redesigned. The existing `vite preview` script expected a missing `dist/server/server.js`; it now uses `nitro preview`, which follows the actual build output.

## Validation

Validated on 2026-10-30 with Node 24.22.1 and npm 11.9.0 (dependencies resolved by npm from package.json; the original bun.lock is retained unchanged):

- `tsc --noEmit`: passed.
- `npm test`: passed, 1 routing test.
- `npm run build`: passed, client and server production bundles.
- `NITRO_PRESET=node-server npm run build`: passed; `npm run preview` served `/`, `/discover`, `/explore/watch`, the hero JPEG and the favicon with HTTP 200.
- All three downloaded binary files passed image-format integrity checks.
- `git diff --check`: passed.

Live signup, OAuth, password recovery and database flows require configured services and were not tested end to end. Copying source does not complete unfinished product features in the Lovable snapshot.

## Runtime and hosting boundary

This is a complete source snapshot transfer, not a database or production-hosting migration. SQL migrations are included; review the existing database migration state before applying them. Hosted authentication settings, API secrets and deployment configuration must be provided separately. The application still uses the existing Lovable/Supabase integrations and build package. Automatic bidirectional Lovable/GitHub synchronization was not established. The original Lovable project was not edited or published.
