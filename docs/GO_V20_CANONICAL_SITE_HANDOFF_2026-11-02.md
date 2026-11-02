# GO — Canonical Site / Version 20 handoff (2026-11-02)

## Authoritative latest product
- Product: GO — Your World, Within / GO Cultural Discovery Super App
- Canonical deployed preview: https://go-private-room-prototype.astutebuddy513.chatgpt.site
- Canonical ChatGPT Site project ID: `appgprj_6ae46c0e73a481919fd6d2ce88f83d1e`
- Version: v20 **as reported by the product owner** on 2026-11-02; the Site source version has not been fetched or independently verified here.
- Earlier site appearance: black entrance with “Step inside” and “Open the door to GO”.
- This Site, not the older Lovable or Google AI Studio source, is the authoritative editing baseline.

## Current repository status (verified 2026-11-02)
- `main` was at `b0498f529b81dd7a57b5811ca4a5b1eefe3d6da6` (latest commit dated 2026-11-01).
- Existing repository implementation is a legacy Lovable snapshot; it **does not represent the canonical v20 Site**.
- PR #3 (`feature/unique-illustrated-rooms`) is draft and unmerged; it is not a verified release of the canonical Site.

## Current product scope / approved latest decisions
- GO DNA: cultural self-understanding based on seen, read and listened-to works, with six dimensions.
- GO Discovery: compare original work scores and audience scores via two Cartesian charts.
- Per-work community ratings across the same six dimensions.
- Add to World: users may submit works for AI-assisted cover and metadata enrichment.
- Comments designed for later, disabled in pilot.
- Bilingual Persian/English; onboarding, personalized Room, Watch/Read/Listen, free/premium tiers.

## Export status / safeguards
**No source files from the canonical ChatGPT Site were available through the connected tools on 2026-11-02.**
This branch records a truthful synchronization checkpoint only; it is **NOT** an import of v20 code, and should not be merged or released under a v20 code tag.

For an actual v20 code transfer and complete backup, export the canonical Site's **original source project** (not compiled browser assets) with its assets and sanitized database schema/migrations, verify the code against the deployed Site, then import it into a dedicated branch and run build/tests. Never commit secrets, live credentials, personally identifiable data, or private database contents.

## Download links
- Canonical Site: https://go-private-room-prototype.astutebuddy513.chatgpt.site
- GitHub legacy source archive: https://github.com/ehsandalir/go-cultural-discovery/archive/refs/heads/main.zip
- Draft PR: https://github.com/ehsandalir/go-cultural-discovery/pull/3
