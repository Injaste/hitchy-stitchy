# MVP Phase 7 — Invitation templates

**Goal:** author **3–5 quality invitation designs** so the invite/RSVP side can
carry real weight. This is a **content/authoring effort, not an engine build** —
the template system is already complete (per the payments handoff MVP assessment).

## What already exists (don't rebuild)
- Template **engine**: `src/pages/wedding/templates/` (renderer, field types,
  Google-font loading), `src/pages/wedding/` (public per-slug invitation page).
- Admin **theme editor** + browse/your-themes galleries + create/publish/delete:
  `src/pages/admin/invitation/themes/`.
- Tables `event_templates` (global catalog) + `event_themes` (per-event instances).
- **Only one template authored:** `unique-muslim`
  (`src/pages/wedding/templates/unique-muslim/`). That's the gap.

## Scope
- Author **3–5 new templates** following the `unique-muslim` structure (Hero,
  Itinerary, RSVP, Footer, background/decoration components + a `types.ts` field
  schema). Register each in `src/pages/wedding/templates/index.ts` and seed an
  `event_templates` catalog row (slug, name, config).
- **SG-relevant styles**: e.g. a Chinese-banquet red/gold theme, a modern minimal
  theme, a garden/floral theme, a Malay/songket-motif theme. Aim for breadth of
  taste, not one aesthetic.
- Make sure the **multi-segment timeline / itinerary** renders cleanly (SG
  multi-ceremony) and the RSVP fields (incl. phase-4 dietary) are themed.

## Known engine gap to close (from misc.md)
- **Image field upload**: the `unique-muslim` field schema supports image *URLs*
  only; native upload isn't wired (`src/pages/wedding/templates/unique-muslim/types.ts`,
  [misc.md](../misc.md)). New templates lean heavily on photos — wire `type: "image"`
  upload in the field renderer so authors/couples can upload, not paste URLs.

## Tier
Free gets 1 template + a "made with Hitchy Stitchy" badge; **Pro** removes the
badge and unlocks **premium themes** + custom domain (per payments handoff). Tag
each authored template Free/premium.

## Complexity
Low–medium **per template** (mostly design/layout), once the image-upload gap is
closed. No data-model change.

## Open decisions
1. **How many + which styles** for MVP (3? 5?). Lock the list.
2. **Image upload storage** — Supabase Storage bucket + RLS; confirm the upload
   path before authoring photo-heavy templates.
3. **Which are Free vs premium**.

## Grounding
- Engine + reference template: `src/pages/wedding/templates/` (`unique-muslim/`, `index.ts`, `types.ts`).
- Public invite page: `src/pages/wedding/`.
- Admin theme editor/galleries: `src/pages/admin/invitation/themes/`.
- Image-upload gap: [misc.md](../misc.md).
- Recipe + guardrails: [mvp-overview.md](../mvp-overview.md).
