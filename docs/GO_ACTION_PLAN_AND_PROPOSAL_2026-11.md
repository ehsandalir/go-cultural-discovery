# اکشن پلن GO — Product Proposal & Change Register
Version: 2026-11-05 | Status: proposed for cofounder review; NOT deployed | Owners: Ehsan (execution/product), Sheida (culture/communications)

## 1. Product direction
GO is a bilingual (English default / Persian selectable) cultural-discovery social web application. The product's profile term is **Vibe** (not DNA). Freemium cultural discovery and social participation remain free. The new visual direction supersedes the earlier black/dark default: **white, neutral, airy, minimal**, based on two user-provided four-panel room reference images. These images are design references; do not copy copyrighted artwork into production.

## 2. Room redesign — requirements
- A single room with FOUR distinct wall/side views. Swipe, arrow, or keyboard navigation rotates/transitions between views with a smooth animation; accessible reduced-motion alternative.
- Reference compositions: (A) bright room with city-facing window and standing mirror, (B) film poster wall and low media crate, (C) music wall with vinyl/record player, (D) bookshelves. Layout and art placement responsive on mobile.
- This is a 2D/lightweight 2.5D experience, not a Blender 3D renderer. Preserve room contents and orientation per user.
- Neutral background/palette; Vibe may subtly influence accents/light without forcing dark styling. Six room-style palettes from earlier plans require visual revalidation against new white baseline.
- Five initial visible **Wall** slots, selected by user, for cultural works (film posters, music sleeves, books and future categories). Wall slots and Box storage are separate capacity ledgers.
- Initial **Box** storage capacity: 25 items, EXCLUDING the five Wall slots. Define transfers between Wall and Box without accidental deletion; no double-charging of capacity.
- Invite reward: each batch of FIVE verified successful referrals earns +10 permanent Box slots, subject to anti-abuse policy and audit. No extra Wall slots from referrals unless separately approved. This replaces earlier temporary +2/+1 slot referral proposal.
- Ensure existing user content is migrated safely if previous capacities differ; do not delete existing items when subscriptions lapse.

## 3. Vibe Card & invitation flow
- Exportable/downloadable and shareable Vibe Card, suitable for Instagram and other channels; readable English/Persian.
- Shows user's FIVE primary **Owned** works represented on Wall, alongside Vibe signature; respect privacy and optional hiding of specific works.
- Share bundle: card image + editable share text + user-specific invitation URL, with attribution code. Deep-link to public landing/sign-up; preserve referral through signup with consent-aware tracking.
- Referral statuses: clicked, registered, verified, qualified, rewarded, rejected; idempotent grant for every five unique qualified referred accounts; audit trail and rollback for fraud.
- Definition of qualified: verified account plus meaningful activity on two distinct days (proposal, confirm with owners); rate limits and duplicate-account checks, without invasive fingerprinting.

## 4. Critical content semantics
**Watched ≠ Owned**. Watched = consumed/viewed the film; Read = read a book; Listened = listened to music; Played = played a game (future). **Owned is NOT legal possession or a purchase**. It is a personally meaningful work whose influence continues within the user: «اثری که بخشی از آن درون من ادامه دارد». Explain this prominently at first use and in help/tooltips.
- Own / Want / Watched / Read / Listened must be separate data fields/events; users can both Watched and Owned the same work.
- Wall features five primary Owned works. A user can change them; avoid treating them as necessarily the only Owned works.
- UI copy proposal: «Watched یعنی دیده‌ام. Owned یعنی این اثر را با خودم حمل می‌کنم؛ بخشی از آن هنوز درون من ادامه دارد.»
- Do not silently infer Owned from watch history, recommendation algorithms, or purchases.

## 5. MVP and economics
- Seed bank: 1,000 films, 5,000 music entries, 500 books; metadata and lawful cover references only.
- Core: auth, Vibe, GoDiscovery, Room, Roommate, Wall, Box, Collection, Community, Hall, GoBack admin, reporting, sharing, referral, privacy, security.
- First three months free access to paid capabilities; clarify whether three months start at public launch or each user's registration before billing code is finalized.
- Monetization: GO Plus subscription, optional paid capacity packs, global affiliate referrals only where eligible/legally payable; Hall is discovery, NOT a marketplace.
- 85% Iran / 15% global scenario; five-year P&L is hypothetical and must be rebuilt after user research, measured conversion, retention and compliant payment feasibility.
- Approved marketing budget: **10 million toman/month beginning month 6**; months 1–5 marketing budget zero. Subsequent increases require separate approval.

## 6. Twelve freemium growth initiatives — year 2 onward
1. Film/music/book/Game (video game is a cultural CATEGORY, not an in-app game) expansion.
2. Instagram/YouTube shareable outputs.
3. Room number identity and seniority value (no speculative trading by default).
4. Special-room waitlists.
5. Event marketing.
6. Active PR.
7. Roommate-based user levels with anti-fraud checks.
8. Cultural titles/badges for levels.
9. Top film and music Rooms, with transparent non-pay-to-win rankings.
10. Vibe-personalized Hall, with serendipity/diversity.
11. Fashion & Style as a cultural category.
12. Parallel Worlds: fictional 'What if...?' experiences; transparent AI fiction and bounded usage.
These are growth/retention levers, not twelve separate paid products. Sequencing is subject to pilot results.

## 7. Security & operations
GO Sentinel proposed as monitoring/reporting agent, not autonomous administrator. Cloudflare WAF/rate limits, secure authentication, admin MFA, Supabase/Postgres RLS, least-privilege service roles, backup/restore drills, dependency scanning, incident logs, spam/report/block/moderation, referral anti-fraud. Sentinel has read-only access by default; no payment secrets or unrestricted database credentials. Critical actions require human approval.
Analytics: signup -> activation -> meaningful activity -> referral qualified -> D7/D30 retention -> MAU -> paid conversion -> churn. GoBack shows cohort metrics, system health and referral liability.

## 8. Three delivery scenarios
**Minimum:** responsive 2D room four-side switch (simple fade/slide), 5 Wall, 25 Box, Owned explanation, static downloadable Vibe Card and tracked referral link; manual moderation; baseline security.
**Acceptable:** animated four-side rotation, polished mobile layouts, verified referral reward ledger (+10 per 5), share bundle, complete privacy controls, GoBack metrics, automated security alerts.
**Desired:** refined room transitions, richer personalization and share templates, cohort experiments, anti-fraud scoring, comprehensive moderation and accessibility; no costly 3D requirement.

## 9. 90-day action plan — «اکشن پلن GO»
Reference start 2026-11-09; dates are targets, not completed work.
**Month 1 (Nov 9–Dec 8):** repository and infrastructure audit; confirm requirements; data model for separate statuses and capacities; white UI design system; Room four-side clickable prototype; define analytics and security baseline. Gate: founders approve prototype and migration plan.
**Month 2 (Dec 9–Jan 8):** implement Wall/Box and Owned onboarding; Vibe Card export; invitation attribution and reward ledger; Roommate, collections, accessibility; private beta 50–150. Gate: functional QA and no critical data-loss defects.
**Month 3 (Jan 9–Feb 7):** GoBack and Sentinel reports, backup recovery, RLS/security tests, payments sandbox, cohort measurement, referral fraud QA; pilot go/no-go decision by 2027-02-07.
Targets proposed: >=100 beta signups minimum, >=40% activation, D7 >=15%, D30 >=10%, zero open critical security issues. These are unvalidated target thresholds.

## 10. Required technical change tickets
- DESIGN-01 white/neutral design tokens, responsive contrast and accessibility
- ROOM-01 four side scene navigation and animation; ROOM-02 wall item placement
- CAP-01 independent Wall=5, Box=25 capacity policy and migration
- REF-01 attribution schema; REF-02 qualification and batch +10 rewards; REF-03 anti-abuse and idempotency
- VIBE-01 downloadable card with 5 primary Owned; VIBE-02 share text and invite URL
- WORK-01 separate watched/read/listened/played/owned statuses and explanatory onboarding
- SEC-01 RLS audit, SEC-02 backups and Sentinel alerts
- ANALYTICS-01 activation/retention/referral/revenue dashboard
- QA-01 tests for capacity boundaries, referral races, privacy, mobile navigation and migration

## 11. Governance and unresolved questions
No production changes or merge without Ehsan and Sheida approval. Clarify: exact free-trial start, whether paid capacity stacks with referral rewards, whether Wall selections must be Owned, exact eligibility rules for invite qualification, permanence of referral-earned Box slots, visibility defaults of Vibe Card, and final room palette options. Do not expose uploaded API keys or secrets in Git.

## 12. Change request — Explore galaxy, room IDs, roommate graph and notifications (2026-11-06)
Status: proposed, not deployed; subject to founders' approval.
- **Box capacity**: free base 25; +10 permanent per five qualified referrals; absolute current cap **95** from all referral rewards (7 batches / 35 qualified referrals). If paid add-on capacity exists, define whether the 95 limit applies globally or only to referral/free capacity before implementation; never delete stored works upon reaching the cap.
- **Room number**: assign a unique, immutable, monotonically increasing public room number at room creation, starting now; atomic database sequence, never reuse even if account deleted. Keep internal UUID separate. Do not expose sequential IDs as authorization tokens. Number is distinct from spatial location and user level.
- **GoExplore**: remove all four planets. Retain infinite galaxy background with floating window-like Room thumbnails, pan/zoom and accessible list/search fallback. Initial capacity **1000 empty room positions in 10 square blocks of 100**; counts are configurable, not hardcoded.
- **Block placement**: first activated room in each block occupies its visual center. Remaining room positions are pseudorandom but stable via stored coordinates/seed; no rerandomization on refresh. User's wording: active rooms spread no more than 30% distance from lit rooms. Proposed interpretation: new active room lies within 0.30 * block width of an already lit room; confirm exact metric and handling of full blocks. Maintain minimum spacing to prevent overlapping windows. Distinguish reserved positions, active rooms, and visibility. Room numbers do not dictate placement.
- **Room cover**: owner may upload custom cover; apply file size/type limits, malware/content checks, privacy/moderation, thumbnails and signed storage policies. Fallback when absent: deterministic cover gradient/palette generated from Vibe's SIX parameters mapped to RGB values; RGB has three channels, so document explicit six-to-three mapping rather than claiming six RGB coordinates. Do not infer sensitive traits.
- **Roommates**: explicit invitation/request -> pending -> accepted -> active; rejected, removed, blocked states. Mutual connection recommended. Count only active, distinct, nonblocked roommates; count updates transactionally. Show count on Room and profile; use active count for future level/titles. Never auto-add referred users as roommates.
- **Notifications**: request received, accepted, removed where appropriate, referral qualified, every five successful referrals reward granted, capacity at 80%/100%, room visit/social interactions (opt-in), security alerts. In-app inbox first; email/push optional opt-in later. Dedupe, per-user notification settings, quiet hours and anti-spam throttling. No public notification of sensitive relationship changes.
- **Technical entities**: rooms(room_uuid, public_room_number, block_id, x, y, cover_asset_id, cover_vibe_version, visibility); galaxy_blocks(id, capacity, center_x, center_y, seed); room_positions(id, block_id, x, y, occupied_room_uuid); roommate_relationships(requester_id, recipient_id, state, timestamps); notifications(id, recipient_id, type, actor_id, payload, read_at, dedupe_key); box_capacity_ledger(user_id, source, delta, referral_batch_id).
- **Tests**: concurrent room-number allocation, stable placement, first-in-block center, 30% constraint under load, collision handling, block overflow, image upload abuse, mutual roommate state transitions, notification deduplication, and 95-slot boundary.
- **Open design decisions**: (a) Is 95 a global Box cap or only referral-earned free capacity? (b) Is 30% a maximum distance between nearest active rooms or a dispersion parameter? (c) When a block fills, should assignment round-robin, balanced, or random? (d) Should roommates be mutual connections or one-way follows? Keep proposed defaults pending approval.

## 13. Approved architecture decisions — 2026-11-06
Approved explicitly by project manager:
1. **Free/referral Box cap = 95 items maximum.** Free base capacity is 25; each 5 qualified referrals grants +10 permanent slots, up to seven reward batches (35 qualified referrals). Paid subscription/add-on capacity is a **separate ledger** and does not count toward the free/referral cap of 95. Total usable Box capacity is the sum of the capped free/referral allocation and applicable paid allocation, subject to separate paid-plan policies. No destructive truncation on downgrade.
2. **GoExplore 30% placement rule = maximum distance to the nearest lit Room.** Within each square block, when placing a newly activated room after its center anchor, choose a stable, collision-free coordinate whose distance to the nearest already lit room is <= 0.30 * block width. Store normalized positions and the layout seed; keep assignments stable on refresh. First lit Room in each block is at its center. For an empty block, the first room is exempt from the neighbor-distance constraint. If no collision-free position satisfies the rule, fail gracefully or use a documented fallback subject to approval; do not silently violate the 30% rule.
These two choices supersede the open questions about the 95 cap and the meaning of 30%. Other design questions remain open. Documentation approval does not authorize merging to main or production deployment.
