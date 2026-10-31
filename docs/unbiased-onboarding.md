# GO — Unbiased first-encounter contract

## Binding UX decision (Nov 2026)

**Before the user enters their room and deliberately opens GO DNA, never mention or show vibes.**

This is a product requirement, not just a visual preference. It is intended to avoid priming users into choosing works that match a named emotional category instead of their own taste.

- Signup and profile ask for spoken language (fa / en / fr / es / de), country and **birth year** (not age).
- Home and public Discover introduce only films, books, music and the user's own choices. Do not display "vibe", "mood quadrant", "dark/deep", any 24 labels, or any GO DNA chart/teaser.
- The first encounter in **each** of GoWatch, GoRead and GoListen shows nine real works. Users can page, search the catalog or search online. A selection is indicated by a checkmark on the original card.
- The initial nine must be diverse across the hidden spectrum rather than sorted with all dark/deep entries first. Keep the order stable per user while the catalog is explored; don't make the order reflect a predicted personality.
- Approved works go directly to user interests. Online results go to user interests immediately but cannot enter the shared catalog until the admin approves them.
- Preserve the internal 24-way scores, primary editorial vibe, and 2D coordinates for later analysis, but do not render them in the pre-DNA user UI. These are **editorial, approximate**, not clinically meaningful.
- The admin's GO Studio may display the taxonomy to curate content. This is not a user-facing exception.
- **First public reveal:** after the user has entered their personal room **and intentionally opened the DNA area**. Until a proper room/DNA route and access boundary exist, the public taxonomy visualizations must remain hidden.
- Keep SEO metadata, buttons, descriptions and route search parameters free from "vibe" or spectrum references before that point.

## QA checks
1. Open Home, Discover, and all three modules in Persian and English: no label, chart, filter, or metadata revealing the taxonomy.
2. Nine items load initially per module and are spread across the internal spectrum without mentioning it.
3. Paging and online searches still work and do not change the meaning of earlier selections.
4. A selected card itself shows a checkmark; a pending online selection is personal, not publicly published.
5. Admin taxonomy and scoring remain accessible only in the admin studio; a public DNA reveal requires the room gate.
