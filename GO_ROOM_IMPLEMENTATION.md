# GO — Personalized portrait room (v2)

The user's two approved portrait mobile mockups define the **fixed room geometry and soft, minimal, slightly realistic 2026 art direction**. Each consenting account receives its own separately generated visual details and selected palette. The room is NOT a static mockup or an image stretched from 16:9.

## Six GO palettes — exact hex triplets

| ID | FA / EN | Wall | Secondary | Accent |
| --- | --- | --- | --- | --- |
| after-rain | بعد از باران / After Rain | #DDECF1 | #85B4C8 | #415B76 |
| peach-dusk | غروب هلویی / Peach Dusk | #F7E5DB | #E7A992 | #7D6D98 |
| sage-pages | سبزِ کاغذی / Sage Pages | #E4EAD9 | #A9BEA4 | #54675C |
| blue-hour | ساعت آبی / Blue Hour | #D9E0F1 | #7189B4 | #3B466A |
| amber-earth | کهربا و خاک / Amber Earth | #F3E5CF | #D8A56B | #9B6D65 |
| lilac-light | یاسی روشن / Lilac Light | #ECE3F1 | #B3A4CD | #D7CF7A |

The app asks **«کدوم ترکیب رنگ بیشتر به حال‌وهوات نزدیکه؟»**, or **“Which color mix feels most like you?”** This is not a system theme selector. The selected palette is always inserted as exact hex codes in the fixed image prompt.

## Approved portrait mockups (actual compressed copies in source)

- **Reference A — from-the-door room:** [public/room-reference-a.webp](public/room-reference-a.webp), same content mirrored for server imports at [src/assets/room-reference-a.webp](src/assets/room-reference-a.webp). This is the geometry master: bed/posters left, city-view window and desk center, vinyl/books/guitar right, rug/pouf below.
- **Reference B — warm mobile app screen:** [public/room-reference-b.webp](public/room-reference-b.webp), mirrored at [src/assets/room-reference-b.webp](src/assets/room-reference-b.webp). This defines softness, realistic materials, depth, mobile UI atmosphere.
- These two in-repository files are compressed reference **thumbnails**, not the source-size originals and not finished backgrounds to serve to paying users. The originals belong in the project design archive; do not use the thumbnails as export-resolution marketing assets.
- **No UI in generated images:** Reference mockups have built-in GO labels/controls, but AI generation must **remove all embedded interface overlays** and render the room only. Actual app controls are a separate clickable DOM layer. The temporary unauthenticated fallback shows reference A as a clearly labeled style preview, never as a generated personalized room.
- Fixed responsive room canvas: `aspect-[9/16]` on phone and tablet, `max-width: 480px` on larger screens, touch targets at least 44 × 44 CSS px. The room should not pan horizontally to expose controls.
- Approved style: compact late-teen/young-adult bedroom with warm practical light, restrained detail and lightly realistic texture; no strong ink outlines, over-staged interiors, photoreal listing shots, 3D game environment, or luxury aesthetic.

## Image generation and data flow

1. Show the approved reference A preview on Home until an authenticated user has a generated room.
2. Consent and choose exactly one of the six palettes; optionally choose up to three GO vibes.
3. Authenticated server function reads explicit favorites while excluding Spotify-derived items/demographics. The server supplies **both actual portrait image references** as inlined `image/webp` parts plus a canonical fixed instruction prompt from `src/lib/personal-room.ts`.
4. Image model renders a clean **9:16 portrait** image; it maintains anchor geometry while varying nonstructural details from cultural preferences and a randomized non-identifying variation token.
5. Store the generated PNG/JPEG/WEBP in the private per-account Supabase Storage bucket and link it through the RLS-protected `go_personal_rooms` table. Never commit secrets or a generated user's image.
6. Home reads a signed URL only for the current user. Navigation hotspots are independently accessible/reactive links on top of the image: GoWatch over bed/film, GoRead over books, GoListen over media, Discover over the city window, Desk over the work area.
7. Regeneration requires a deliberate click/explicit consent and is rate limited to two attempts/day.

## Verification status

The earlier baseline had a successful historical test/build run, but **the new portrait changes have NOT yet been typechecked, built or browser-verified**. The baseline status in [GO_LIVE_STATUS.md](GO_LIVE_STATUS.md) does not validate this update. The portrait room remains on draft PR #3, NOT main, and requires build, auth and device testing before merge/deployment.

## Deployment checklist

- Apply `drizzle/migrations/0002_go_personal_rooms.sql` to the correct Supabase database (only after review).
- Store `GEMINI_API_KEY` in **server-side secrets**, never `VITE_*` or GitHub. You can override the default image-capable model using server-only `GO_ROOM_IMAGE_MODEL`.
- Verify the configured image model supports input-image editing and image-output generation. Google billing, access and quotas may apply.
- Test signed URL access with two different accounts (cross-account access must fail).
- Verify 9:16 portrait aspect on 320/375/393/430/768px displays, RTL and LTR, readable image scale, keyboard and 44px touch hotspots, signed images' aspect ratio and production-worker ?inline asset bundling.
- **No live credentials, database migrations, deployment, or image generation were performed by this commit.** PR review and integration tests are required.
