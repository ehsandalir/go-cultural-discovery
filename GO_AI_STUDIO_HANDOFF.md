# GO → Google AI Studio: safe import and continuation

Status: **handoff prepared, not yet imported into Google AI Studio**.

## Source of truth

- GitHub: `ehsandalir/go-cultural-discovery`, default branch `main`.
- Pending unmerged illustrated room feature: draft PR **#3**, branch `feature/unique-illustrated-rooms`. Do not assume the content is in `main` after GitHub import; do not silently merge it.
- Legacy Lovable project: `e3f74c39-baf4-4075-9ccf-b860f5fc3987`. Preserve its commit history and do not force-push. Lovable credits are exhausted, so Google AI Studio is the intended new editing environment.
- This is an EXISTING real codebase, **not a greenfield app**. Do not scaffold a different app or replace existing features with dummy components.
- The repo is public; no .env with keys or user information should ever be committed.

## Import: official Google AI Studio Build Mode steps

1. Go to <https://aistudio.google.com> and open **Build** → **Web app**.
2. On the prompt box press **+ (Add files)** → **Import from GitHub**.
3. Authorize the Google AI Studio GitHub integration, selecting access to `ehsandalir/go-cultural-discovery`.
4. Choose the existing repo, not "Create new repo". Import the default `main` branch to start. If AI Studio offers a branch selector, you can import a distinct review branch, but **do not overwrite main**.
5. Paste the prompt below. Do **not** enable auto-publish or agree to a destructive repo overwrite.
6. Use AI Studio Settings → GitHub for two-way sync. Review diffs before pushing. Use a new branch/PR for framework or auth changes.

**Official documentation:** https://ai.google.dev/gemini-api/docs/aistudio-build-mode

## Paste as the FIRST AI Studio Build prompt

```text
You are continuing an EXISTING project: GO — Cultural Discovery Super App.

IMPORTANT: The existing repository is the source of truth. Import and inspect it, do NOT create a new unrelated app. Begin with a dependency, runtime and file-based routing audit. Preserve its data model, current auth, registered routes, and functioning flows. Make ONLY the minimal, reversible changes needed to make a local preview run. Report anything not verifiable. Do not publish, deploy, delete data, force-push, rewrite history, modify Supabase database schemas, or commit secrets without my explicit instruction.

The codebase uses TanStack Start + React 19 + TypeScript + Vite + Tailwind CSS + Supabase + Drizzle, with server functions, server-auth middleware, protected routes, and 24 emotional vibes. Its Lovable integration handles some Google OAuth. Do not migrate to Next.js or a new React/Express architecture without demonstrating that the existing stack cannot run here and seeking approval first. If preview runtime is incompatible, diagnose EXACTLY which server/adapter issue is blocking it. Keep code working in the existing deployment environment.

BUSINESS AND PRODUCT CONTRACT:
GO is a bilingual (FA RTL / EN LTR), mobile-first, editorial cultural discovery app: GoWatch, GoRead, GoListen; later GoStyle, GO DNA and creator features. Canonical 24 vibes and quadrants are in src/lib/vibes.ts; do not overwrite them. Plans are GO Free (unlimited discovery), GO Inside (deep analysis) and GO Create (publish collections); pricing is not set. No fake recommendations, fake auth success, fabricated metadata or mock AI image presented as real.
Home is a PERSONAL 2D ILLUSTRATED ROOM, NOT a photorealistic bedroom, 3D game or aesthetic interior photo. The room has fixed spatial anchors/hotspots (desk, city window, CD/vinyl shelf, video drawer, bookshelf, wardrobe, mirror, posters, wall photographs) for cultural module navigation. Every consenting user eventually receives a distinct illustration, generated from an ACTUAL fixed sketch reference image + immutable master prompt + their explicitly saved cultural favorites/vibes + one of EXACTLY 6 curated color palettes. Room palette must not change the app's overall theme.
Six room palettes, three hex colors each:
After Rain #DDECF1 #85B4C8 #415B76;
Peach Dusk #F7E5DB #E7A992 #7D6D98;
Sage Pages #E4EAD9 #A9BEA4 #54675C;
Blue Hour #D9E0F1 #7189B4 #3B466A;
Amber Earth #F3E5CF #D8A56B #9B6D65;
Lilac Light #ECE3F1 #B3A4CD #D7CF7A.
Exact palette question FA: «کدوم ترکیب رنگ بیشتر به حال‌وهوات نزدیکه؟»
EN: "Which color mix feels most like you?"
Never show a traditional theme switcher in room onboarding.

CURRENT WORK IN A SEPARATE UNMERGED BRANCH:
Draft GitHub PR #3, feature/unique-illustrated-rooms. Contains the proposed 2D sketch, six-color selector, secure image-generation prompt, a private storage migration and room UI. It HAS NOT passed full typecheck/runtime/production tests and database changes have NOT been applied. Do not act as if PR #3 is on main. Once the main app preview works, inspect this PR and perform tests, review storage isolation, correct generated-image hotspot alignment, and propose its merge in a separate stage; do not merge blindly.

SECURITY:
- Never expose, print or commit API keys. Treat any user-supplied API key as confidential. Secrets in server runtime, NOT VITE_*.
- Supabase service-role key is server-only. Do not disable existing RLS.
- Explicit AI opt-in before sending cultural favorites to Google; exclude demographics and Spotify-derived favorites.
- Don't invent a successful Google sign-in when provider config is missing.
- Never perform unapproved migrations or real data deletion.

FIRST TASK IN THIS IMPORT:
(1) Identify the existing repo's entrypoint, routes, package scripts and server runtime.
(2) Verify install/typecheck/tests/build or report limitations.
(3) Make minimal changes for runnable preview, if needed, without redesign.
(4) Show an honest audit: what works, what is blocked by credentials, and what to do next.
(5) Keep changes in a separate GitHub branch/PR instead of replacing main.
I will approve later work on personalized room generation after baseline works.
```

## Required secrets and safety

The existing `.env.example` lists configuration VARIABLE NAMES only. Configure them in AI Studio's server-side Secrets panel and, where needed, safe browser env variables. **Never paste secrets into the prompt or into code.** The app may need:

- Supabase browser URL and browser-safe publishable key.
- Supabase server URL and server-safe publishable key.
- Optional Supabase service role only for trusted server actions (keep private).
- Gemini API key for image generation (server-side).
- Third-party film/music catalog keys if enabled.
- Existing OAuth provider setup / redirect origins; Google login in the old environment used Lovable-mediated OAuth and may require reconfiguration in a new runtime.

**Google AI Studio's own Google login is not necessarily equivalent to GO user's Google/Supabase sign-in.** Verify them separately.

## Acceptance sequence (do not skip)

1. Existing baseline app imports without rebuilding from zero.
2. `npm install` (or equivalent), TypeScript, tests, and build verified where supported.
3. FA/EN toggles, root Home/Discover/Library/Profile and protected route behavior verified.
4. Google Auth and Supabase tested in AI Studio-compatible preview with permitted redirect URLs.
5. Review/repair draft PR #3, test and merge once ready.
6. Images generated server-side from real user choices and an actual sketch; persist privately; no fake previews.
7. Only then consider deployment after explicit approval.

## Known constraints

- Google AI Studio's built-in full-stack environment normally uses a Node.js runtime; TanStack Start in this repo uses a Nitro target inherited from the Lovable project. Inspect before changing the adapter.
- Import and GitHub two-way sync are supported, but provider UI might change.
- AI Studio free usage is rate-limited; Gemini image generation and Cloud Run deployment may incur additional costs.
- Do not try to fetch or depend on secrets stored only in chat uploads. Configure secrets through the deployment platform.
