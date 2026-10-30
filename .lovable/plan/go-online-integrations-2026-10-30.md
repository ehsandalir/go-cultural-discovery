# GO online integrations

## Experience
- Switch every existing screen to English LTR; preserve working accounts, roles and protected pages.
- Replace the landing page with a cinematic, responsive 2D personal room. Keep fixed physical-object destinations and conventional navigation. Add the Hidden Door entrance to onboarding.
- Add optional, skippable onboarding: name, optional age and gender, country, language, and up to three selected or typed favorites per Movies, Music, Books and Style.
- Separate permission to save preferences from permission to send cultural favorites to Gemini. Never send demographics to AI or claim psychological/DNA scores.
- Save and reload only the signed-in user's preferences. Allow editing, consent withdrawal and clearing saved preferences.

## Integrations
- Authenticated server-side search: TMDB when configured, public Google Books requests with honest failure states, and Spotify only when a valid authorized connection/token exists. Manual entries remain available.
- Server-only Gemini cultural taste analysis using `GEMINI_API_KEY`, with validated limited output and a deterministic, clearly labeled room preset when AI is unavailable. Never silently substitute another provider.
- No service keys are currently configured and no workspace connections are available. Implement safe unconfigured states and report the exact secrets needed.

## Assumptions and approval
- The supplied approved contract defines the room; any missing Hidden Door source document is interpreted as a subtle door entrance followed by a minimal step-by-step onboarding flow, not a new marketing page.
- Public Google Books lookup is allowed for this implementation; respect its quota and do not invent catalog results.
- **Rate-limit tradeoff:** Lovable Cloud currently has no standard rate-limiting primitive. Approval of this plan authorizes an ad-hoc, database-backed per-user request limit for catalog search and analysis. It is not a full abuse-protection service. Limits will be documented and tested; never use process-local counters.
- Spotify needs appropriate authorization; do not use Spotify content in Gemini prompts or pretend it is connected.

## Technical details
- Keep TanStack Start, existing bearer middleware, CSRF protection, auth layout and role checks.
- Add an owner-scoped onboarding table with explicit grants and SELECT/INSERT/UPDATE/DELETE RLS policies; derive owner identity from verified authentication, not client input.
- Use validated server functions for search, persistence and analysis. Keep all secrets inside server request handlers.
- Model 48 vibe/atmosphere profiles while visibly demonstrating four room presets; daypart is separately adjustable.
- Add focused tests for favorite limits, consent boundaries, private ownership and deterministic room presets. Verify the signed-in save/read flow plus desktop/mobile room navigation and available live APIs.

## Delivery
Report tested functionality, honest integration blockers and manual secret requirements. Keep the app in preview; no publishing.