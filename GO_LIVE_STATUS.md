# GO live verification — 2026-11-01

## Published baseline

- Live URL: https://vibe-cinema-page-turns.lovable.app
- Existing Lovable project: `e3f74c39-baf4-4075-9ccf-b860f5fc3987`.
- Deployment ID: `5d7e2400-37fa-4c08-8257-98809b5e7ee7`.
- The native publishing result was followed by `is_published: true`.
- HTTP checks returned 200 for `/`, `/auth`, `/discover`, and `/library`. This verifies HTTP availability, not browser hydration or authentication success.
- This is the existing baseline, not the unmerged personal-room feature.

## Authentication connection

- The existing backend's `/auth/v1/settings` returned 200 using its existing publishable configuration.
- Both Google and email providers are enabled. Signup is enabled and email confirmation is required.
- The live site's `/~oauth/initiate` returned a 302 to `oauth.lovable.app` for Google. This verifies the initial broker route, not the complete OAuth callback or session persistence.
- No account was created, no password was changed, and no user data was modified in this verification.
- GO still uses Lovable-brokered Google OAuth. An external runtime must support that broker and its allowed callback origins; an API key alone is not OAuth configuration.

## Personal-room branch verification

Work remains in draft PR #3, `feature/unique-illustrated-rooms`; it has not been merged into `main` or the published baseline.

- Fixed the protected-route redirect to use the auth route's declared `next` parameter. Preserve query parameters and the fragment by carrying `location.href`.
- Added signed-out redirect and signed-in continuation regression tests.
- Added an npm lockfile for reproducible Node/npm installs; the existing Bun lockfile is retained.
- `npx tsc --noEmit`: passed after the fix.
- `npm test`: 4 files and 8 tests passed.
- `NITRO_PRESET=node-server npm run build`: passed.
- Node production HTTP smoke check: `/`, `/auth`, `/discover`, all three `/explore/{watch,read,listen}` routes, and `/room-layout.svg` returned 200.
- The rendered Home HTML contains the base sketch and all six palette labels.
- Default `npm run build` (Cloudflare target): passed.
- Browser/mobile/RTL visual QA, image generation, and private storage isolation remain unverified.

## AI Studio and remaining blockers

- Existing imported AI Studio app: https://aistudio.google.com/apps/4aae3362-8d63-4c5e-bfdf-f6ddcf31fd9d
- Import was observed in AI Studio. No second import or overwrite was performed.
- AI Studio requested Supabase environment configuration. It was not applied during this run because the browser execution environment failed with `ENOSPC`, then could not restart.
- The public browser configuration exists in the original project's environment. For external server-side user-scoped operations, configure the reachable backend URL and publishable key as `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; privileged service-role access is not needed by the room handlers.
- The database was inspected read-only. `go_personal_rooms` was absent. Migration `0002_go_personal_rooms.sql` was not applied.
- Gemini server configuration and a real image-generation request remain unverified. No uploaded API key was printed, committed, or transmitted to a new hosting service.
- Do not present the personalized image flow, AI Studio connection, or Google OAuth completion as finished until these checks are performed.

The published baseline provides a live starting point. Completion of the AI Studio migration and personalized room still requires a working AI Studio control session, runtime configuration, and end-to-end verification.
