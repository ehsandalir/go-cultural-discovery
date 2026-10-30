# GO — Implementation Plan
**Version:** 2.0 · **Date:** 2026-10-30 · **Status:** staged execution plan

## 1. Technical ownership and working rules
The technical implementation is owned by the assistant in this project workflow, with the product owner making product decisions and granting any required account/deployment approvals. Work in feature branches; do not push unreviewed work to production or overwrite main without a verified diff. Preserve existing working behavior. No secrets or production API keys in source control.
For each task: inspect current code, state exact scope, implement, run available checks, inspect the diff, and report what passed, failed or remains unverified. Never describe a feature as working until it has been run and tested.

## 2. Repository reality and stack
The GitHub repository is the source of truth. Inspect the current package.json, router, component structure, database client and migrations before assuming a framework or replacing architecture. Keep the existing working stack where possible; do not rewrite the app to match an older plan.
Use Supabase only through environment variables and server-enforced policies. Keep authentication, profile data and admin authorization distinct. Do not commit secrets. Verify OAuth redirect URLs and provider configuration in the actual Supabase project before claiming Google sign-in works.
Use responsive CSS and optimized image assets. Do not introduce a 3D engine or unnecessary paid service.

## 3. Product scope through 1,000 registrations
### Milestone 1 — working MVP / first 100 registrations
- Audit current repository against UI Spec 3.0.
- Fix app entry and authentication flow (email/password and Google OAuth when configured).
- Implement the 2D Personal Room as the signed-in Home with stable object navigation.
- Add GoStyle as a first-class route and editorial screen.
- Ensure Watch, Read, Listen, Discover, DNA, Journey and Profile routes have honest functional states.
- Add shared content model and initial curated catalogue; do not fabricate metadata.
- Implement saving and basic Vibe selection.
- Add basic admin content management with server-side authorization.
- Add event tracking for onboarding, discovery, save/rating, room view and return.
- Test mobile layouts, accessibility, error/loading/empty states.
**Exit gate:** no blocking auth/navigation defects; 100 invited testers; meaningful content interaction and 7-day retention measured.

### Milestone 2 — controlled beta / 400 cumulative registrations
- Improve Discover and cross-category Same Vibe, Different Art.
- Add lightweight, explainable rule-based recommendations.
- Add public user rooms/collections as defined by product scope; keep creator authoring separate if not ready.
- Implement GO Open Doors experiment: five initial public rooms, unlock broader public-room browsing after five qualified invited registrations.
- Add anti-abuse checks, referral attribution and event instrumentation.
- Recruit a broad, relatable founding cohort of ordinary users, not celebrity influencers.
- Interview active and churned users; iterate onboarding and room discovery.
**Exit gate:** 400 cumulative registrations; referral funnel, activation and retention are measurable; no critical abuse or privacy issue.

### Milestone 3 — early growth / 1,000 cumulative registrations
- Improve onboarding and first-session value.
- Improve content coverage and quality across Watch, Read, Listen and GoStyle.
- Promote real user collections and diverse taste profiles.
- Run measured referral and social-content experiments.
- Monitor activation, D1/D7/D30 retention, meaningful discovery, qualified referrals and cost per activated user.
- Fix reliability, performance, accessibility and security issues found in beta.
**Exit gate:** 1,000 real registrations with a measurable active cohort and documented retention; registration count alone is not success.

## 4. GO Open Doors rules
Threshold: 10,000 registered accounts, not 10,000 active users. This is a temporary growth experiment, subject to review at the 1,000-registration milestone.
- Five public rooms visible initially.
- Five qualified invited registrations unlock unlimited public-room browsing.
- Define qualification as account verified plus first meaningful product action; instrument the event.
- Never count invite-link sends alone.
- Prevent duplicate account/referral abuse.
- Do not restrict personal library, profile, account controls or essential accessibility.
- Do not add tiered 10/20/50/100 room ladders without a separate experiment and approval.

## 5. GoStyle implementation scope
MVP GoStyle is a cultural/aesthetic discovery module, not commerce:
- /style route and navigation entry from the Home wardrobe;
- curated style themes and visual references;
- color palette exploration;
- save-to-collection interaction if shared collection infrastructure exists;
- Vibe tags and editorial descriptions;
- responsive loading, empty and error states.
Deferred: product marketplace, affiliate commerce, shopping checkout, body/face analysis, virtual try-on, AI stylist and user-published creator rooms.

## 6. Build sequence
1. Repository and environment audit.
2. Documentation alignment (UI Spec 3.0 and this plan).
3. Authentication and protected-route verification.
4. Personal Room and navigation.
5. GoStyle route and content model.
6. Core content routes and saving.
7. GO Open Doors/referral experiment (after public rooms exist).
8. Analytics, QA and staged beta.
Do not implement referral gating before enough public rooms and a meaningful first-session experience exist.

## 7. Analytics definitions
- Registration: unique verified account.
- Qualified referral: invited account verified and completes first meaningful action.
- Activation: new user completes onboarding and performs at least one meaningful content action.
- Meaningful content action: save, rate, review, add to a collection, or explicit feedback; passive impression alone does not qualify.
- Retention: user returns and performs a meaningful action on a later day.
Track D1, D7 and D30 cohorts. Report both registrations and active users.

## 8. Risks and safeguards
- Content cold-start: seed a coherent, quality-controlled catalogue before inviting users.
- Over-complexity: ship a compelling core loop before advanced DNA or creator tools.
- Referral gaming: qualify referrals and monitor suspicious patterns.
- Empty community: do not expose empty public-room surfaces; seed with real, consented founding members.
- Privacy: collect only necessary signals and disclose personalization.
- OAuth and secrets: configure outside source code and test against real provider settings.
- Asset rights: use approved/licensed assets and retain provenance.

## 9. Release discipline
- All work occurs in a feature branch and is reviewed via diff.
- Automated checks and manual mobile smoke tests precede merge.
- Production deployment requires explicit owner approval.
- At each milestone, record completed scope, test evidence, open defects and go/no-go recommendation.
