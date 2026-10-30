# GO — UI/UX Specification
**Version:** 3.0 · **Date:** 2026-10-30 · **Status:** Implementation baseline for MVP

## 1. Product experience
GO is a mobile-first cultural discovery product built around personal taste and emotional experience, not a conventional genre catalogue or celebrity-following network. Brand promise: **Discover. Feel. Understand. Create.**
The visual language is minimal, cinematic, editorial, warm, and human. Avoid influencer-first positioning, gamification, fake 3D, clutter, and generic social-feed patterns.

## 2. Product information architecture
- Home / Personal Room — /
- GoWatch — /watch
- GoRead — /read
- GoListen — /listen
- GoStyle — /style
- Discover — /discover
- GO DNA / Spectrum — /dna
- My Journey — /journey
- Profile & settings — /profile
- GO Studio — admin-only

Home is an emotional, navigable 2D room, not the whole application. Conventional navigation must remain available and accessible on every screen.

## 3. Personal Room — fixed interaction map
| Room object | Destination | Behavior |
|---|---|---|
| Desk / tabletop | Home | Current vibe and personal picks |
| CD / vinyl shelf | GoListen | Open music discovery |
| Video drawer | GoWatch | Open film discovery |
| Bookcase | GoRead | Open reading discovery |
| Wardrobe | GoStyle | Open style discovery |
| Mirror | GO DNA | Spectrum and taste profile |
| Movie posters | Discover | Cross-category discovery |
| Photographs | My Journey | Personal cultural history |
| Window | Atmosphere | Decorative scene; no mandatory navigation |
| Profile icon/menu | Profile | Account and settings, never the wardrobe |

Object hit areas should be usable by touch, keyboard and assistive technology. Each object needs an accessible text alternative and a conventional navigation equivalent.

## 4. GoStyle — independent cultural module
GoStyle is a first-class module alongside GoWatch, GoRead and GoListen. It explores personal style and visual self-expression through clothing and outfit inspiration; color palettes and combinations; aesthetic directions and visual references; personal style collections / moodboards; and discovery of styles through Vibes and user-curated collections.
GoStyle is not the user's account profile, not a shopping checkout, and not merely a wardrobe illustration. The wardrobe is the Home entry point; /style is a content-led editorial experience. Do not add commerce, brand placement, affiliate links, or purchasing flows without separate approval. Initial MVP may use curated visual references and collections; do not imply image recognition, virtual try-on, or automated stylist functionality until implemented and tested.

## 5. Visual system
- 2D illustrated / photo-illustrative room; no 3D engine.
- Layered artwork: room base, window, lighting, decor, atmosphere tint, UI.
- Stable room geometry and hotspot positions across atmosphere variants.
- Dark-first identity; palettes adapt to selected Vibe without reducing legibility.
- No text baked into artwork.
- Editorial typography, generous spacing, restrained labels.
- Responsive mobile composition; preserve all core destinations at 375px width.
- Respect reduced-motion preferences; transitions are subtle and optional.
- Body text contrast target >= 4.5:1; touch targets >= 44x44 CSS px where practicable.

## 6. Languages and direction
One active locale at a time: Persian (fa-IR, RTL) or English (en, LTR). Never show both translations simultaneously except fixed product names and source metadata. Persist locale for signed-in users and locally for guests. All navigation, empty states, forms, validation, and accessibility labels must be localized.

## 7. Vibe and atmosphere model
The 24 canonical Vibes remain fixed unless the product owner explicitly approves a change:
**Dark & Deep:** Existential Void, Beautiful Suffering, Melancholic Beauty, Psychological Abyss, Surreal Mind, Intellectual Maze.
**Dark & Light:** Dark Curiosity, Beautiful Chaos, Rebellion, Twisted Humor, Dangerous Desire, Adrenaline Rush.
**Bright & Deep:** Hope & Renewal, Human Connection, Romantic Longing, Spiritual Wonder, Quiet Wisdom, Bittersweet Nostalgia.
**Bright & Light:** Quiet Comfort, Playful Joy, Feel-Good Escape, Dreamy Romance, Sunny Optimism, Pure Fun.

Each Vibe has Soft and Intense appearance profiles (48 configurations total). These are atmosphere variations, not 48 separate layouts. Time of day (dawn/day/dusk/night), intensity, Vibe and manual overrides are independent settings. DNA-based changes require opt-in and meaningful user action; never infer health or mental state.

## 8. GO Spectrum and GO DNA
Spectrum axes: Dark ↔ Bright and Deep/Complex ↔ Light/Simple. GO DNA has six aesthetic-taste dimensions: Emotional Depth, Complexity Seeking, Novelty Seeking, Intensity Preference, Reflective Preference, Comfort Seeking.
DNA describes aesthetic preferences, not clinical or psychological diagnosis. Phase 1 uses explicit user choices and a demo/preview only. Advanced signal-based personalization is deferred until consent, transparency, confidence and override flows are implemented.

## 9. Rooms, community and discovery
GO should feel like a community of ordinary people with relatable cultural tastes, not a showcase for celebrities or famous influencers. Public rooms and collections should surface diverse real users and their tastes. Do not make celebrity status a prerequisite or primary discovery ranking signal.
The initial founding cohort is a diverse group of ordinary users across film, music, reading and visual/style interests. They should contribute real collections, Vibe choices and feedback.

### GO Open Doors — early growth experiment
Until GO reaches **10,000 registered accounts** (not active users), the proposed experiment is:
- a new account can initially browse five selected public rooms;
- unlimited public-room browsing unlocks after five successful invited registrations;
- an invitation counts only after a genuine account registration and a defined first meaningful action, not merely sending a link;
- anti-abuse controls must prevent duplicate/fraudulent accounts;
- core personal library, account settings and essential product functions must not be held hostage to referrals;
- show clear progress and explain the unlock condition before asking users to invite.
This is a growth experiment, not a permanent product rule. Instrument invite sent, invite accepted, qualified registration, unlock, activation and retention. Re-evaluate at 1,000 and 10,000 registrations. Do not make the unlock ladder more complex unless experiments show a clear benefit.

## 10. MVP boundaries
In MVP prioritize: authentication, personal room, conventional navigation, content discovery across Watch/Read/Listen, initial GoStyle editorial route, basic content details and saving, manual Vibe selection, lightweight recommendations, admin content entry, analytics events and GO Open Doors experiment.
Defer: advanced DNA inference, full Creator Room Studio, paid subscriptions/payment, commerce, virtual try-on, complex social graph, advanced AI stylist, and production-ready 48 bespoke artwork exports.
GO Create public creator-room publishing remains a later phase; viewing public rooms is distinct from authoring them.

## 11. Screen contract
- Home: layered room artwork, object navigation, current Vibe and a restrained route to standard nav.
- Watch/Read/Listen: editorial landing, search/filter, content cards, details, save/rate states where implemented.
- GoStyle: editorial hero, style themes, color palettes, curated references, collections; clear empty/loading/error states.
- Discover: cross-category Vibe-led exploration and Same Vibe, Different Art.
- DNA: opt-in explanation, Spectrum, six dimensions and useful empty state.
- Journey: chronological personal cultural activity.
- Profile: account, privacy, language, accessibility and session controls.
- GO Studio: admin-authorized content operations only.

## 12. QA acceptance criteria
1. All Home destinations work with touch, keyboard and conventional navigation.
2. GoStyle is reachable from Home wardrobe and standard navigation.
3. GoStyle is distinct from Profile and contains no unapproved commerce.
4. Home is 2D, responsive and not game-like.
5. Persian and English layouts render independently with correct direction.
6. Core screens remain usable at 375px width.
7. All canonical Vibes remain unchanged and each has Soft/Intense configuration.
8. Atmosphere changes do not move navigation targets.
9. Reduced-motion and contrast requirements are respected.
10. No DNA inference without consent; manual overrides remain available.
11. Referral restrictions never block core personal account functions.
12. No fake buttons, placeholder links presented as working features, or production claims without verification.
