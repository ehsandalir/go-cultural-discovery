> **Current authority — 2026-11-09:** Ehsan approved GO **Sites v45**, source `9d48a77b37f6ae243c1bf46eedf5df9c7c11b530`, as the current final approved baseline. [Read the approved baseline](docs/GO_APPROVED_BASELINE_V45_2026-11-09.md) and [status report](docs/GO_STATUS_REPORT_2026-11-09.md). They supersede conflicting historical instructions below. This GitHub branch's application code has not been synchronized to v45 by this documentation update; do not deploy its older code as the approved release.

# GO — Google sign-in release checklist

> This repository is a standalone source snapshot of a Lovable Cloud project. Changes to GitHub do not automatically update the Lovable preview unless Git sync is explicitly connected. Never put Google OAuth secrets or service-role keys in this repository.

## Current product

- Lovable project: https://lovable.dev/projects/e3f74c39-baf4-4075-9ccf-b860f5fc3987
- Preview: https://id-preview--e3f74c39-baf4-4075-9ccf-b860f5fc3987.lovable.app
- Google login is started with `lovable.auth.signInWithOAuth("google", { redirect_uri })`, which exchanges the Lovable Cloud tokens into the Supabase session. Do not replace this with a separate Supabase provider call without migrating the authentication backend.

## Provider configuration (required, not stored in source code)

1. In the Lovable editor, open **Cloud → Users → Auth settings → Google**.
2. Enable Google and choose **Managed by Lovable**, unless a fully configured custom Google OAuth app is required. In managed mode, Lovable handles credentials; a Google API key is **not** an OAuth Client ID or Client Secret.
3. In **Cloud → Users → Auth settings → Advanced**, confirm the preview/actual deployment URL is allowed as a redirect URL. Add published/custom domains only when actually used.
4. For **Your own credentials** instead, configure an OAuth **Web application** Client ID and Client Secret in Google Cloud; add the exact redirect URI(s) Lovable displays and select those authorized destinations back in Lovable. For a Google app in Testing status, add the test users.
5. Save settings. Do **not** paste OAuth secrets into git, tickets, chat logs, or client-side `VITE_` variables.

## Verification

- Open the actual preview or published app in a browser and go to `/auth`.
- Press **Continue with Google** and choose an account. Expect the Google consent UI, a return to `/auth?next=...`, then a Supabase-authenticated redirect to the intended protected route, default `/profile`.
- Try an invalid/cancelled OAuth request; expect an actionable error and no blank page.
- Refresh, close/reopen the tab, and visit `/library`; ensure the session persists. Repeat on iOS Safari.
- Test normal email/password login and signup to ensure no regressions.
- Run `npm test`, `npx tsc --noEmit`, and `npm run build` in a configured environment.

**Limitations:** GitHub cannot validate whether Lovable Cloud Google sign-in is enabled or has valid redirect allowlisting. Browser-level OAuth completion requires an enabled backend and a real sign-in attempt.
