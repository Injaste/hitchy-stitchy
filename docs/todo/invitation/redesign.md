# Invitation Links + agnostic template engine — high-level design

> **Status:** high-level approach for review. No code yet. This doc settles the
> *shape*; the deeper component/SQL specs come in a follow-up once the model and
> the open sub-decisions below are agreed. Supersedes the "author 5 templates"
> framing of [phase-7 templates](templates.md) — we harden the
> engine first, then author against it.

## Why
Two forces converged:
1. **Engine review** found the template system is well-built but not cheaply
   extensible — each template is a ~600-line bespoke mini-app, with font/style
   infra, the RSVP section, anchors, and itinerary parsing duplicated per
   template, themed through a per-template CSS-var namespace (`--um-*`). Adding
   5 more multiplies that. (See the audit summary at the bottom.)
2. **New product direction:** the couple should be able to publish **several
   invitation pages per event** — one per ceremony/day/segment — each with its
   **own design, own freeform content, and its own RSVP funnel**. SG multi-day,
   multi-audience weddings (family-only akad vs public reception) need this.

These are one project: per-link pages are *why* templates must become agnostic.

## Locked decisions (this session)
- **A "link" is a free-standing invitation page.** Not rigidly 1:1 with a day.
  Each link may optionally anchor to a **day** or a **segment** (for ordering /
  context), but the couple can make several.
- **Each link is fully independent:** its own template choice, its own published
  design + config, its own RSVP settings (mode / deadline / guest limits /
  confirmation), and its own RSVP submissions.
- **Content is freeform.** Every rendered string is editable; nothing is
  auto-derived or locked. We do **not** pull the ops `event_segments` timeline
  into the invite — "the couple builds their own page; we're just the tool."
- **Homes for the new data:** theme + RSVP config stay managed in the existing
  **invitation** admin surface (now per-link); submissions extend the existing
  **guests** page (gaining a link/day/segment dimension) — not a new home.
- **Templates become agnostic:** a template is handed a normalized page context
  + a semantic theming contract and just renders it. No per-culture code paths;
  culture = styling + content only.

## Phase 0 — agnostic engine refactor (do this FIRST; no new features)
**The current single-page system must be clean + template-agnostic and still
work *before* any link/multi-page work — there's no point extending a foundation
that breaks.** Behaviour-preserving only: success = `unique-muslim` renders
identically + `npm run build` green. No `link_id`, no per-day anything, no
migration unless something forces it.

### Target shape
- **One template = one HTML component.** Collapse `unique-muslim`'s `Hero` /
  `Details` / `Itinerary` / `RSVP` / `Footer` / `Background*` / `Floating` /
  `Envelope` markup into a single `index.tsx` render block — length is fine,
  "build once, forget." Bespoke per-culture markup isn't worth fragmenting into
  section files (no reuse across templates anyway).
- **Config lives in its own files** beside it: `types.ts` (field schema + config
  type), `form.ts` (RSVP theming), `anchors.ts`, `styles.css`. Data, not markup.
- **Engine = the template-agnostic shared layer** (`templates/engine/`):
  - **`ThemeShell` / `useThemeAssets`** — owns font `<link>` injection + the
    scoped `<style>` tag + root CSS-var wiring (the ~50 lines pulled out of
    `index.tsx`). Each template **declares its own default fonts** (theme-matched,
    overridable by the couple's font-URL fields); the engine does the plumbing.
  - **`useRsvpSection`** — the shared RSVP state machine (RSVP fetch + mutations,
    isEditing/submitted, deadline, submit/delete handlers). Templates render the
    RSVP **markup** inline but drive it from this hook. Template-owned visuals
    (confetti colours, success layout) come in as options / live in the markup.
  - **Registry** stays the seam: `slug -> { component, schema, form, anchors,
    defaultFonts }`. Typed; fallback is an explicit named const (still
    `unique-muslim` while it's the only template).
- Already-shared engine primitives kept as-is: `RSVPForm`/`RSVPDelete` (`form/`),
  `AnchorBar` (`anchors/`), the `google-font-url` util, the public fetch/render
  path.

### Files (as built — DONE 2026-06-13)
- **New:** `templates/engine/useThemeAssets.ts` (iframe-aware font/style
  injection, returns root `--theme-font-*` vars) + `templates/engine/useRsvpSection.ts`
  (the RSVP state machine).
- **Rewrite:** `templates/unique-muslim/index.tsx` — one component absorbing
  Hero/Details/Itinerary/RSVP/Footer/Background*/Envelope + the itinerary parser;
  declares its own `DEFAULT_FONTS`; **the `pageConfig.slug === "unique-muslim"`
  guards are removed** (the component owns its config) — this is what fixes the
  blank-render bug.
- **Deleted:** the 9 section files (incl. the unused `FloatingIcons`).
- **Unchanged (no edit needed):** `templates/index.ts` registry, `types.ts`,
  `form.ts`, `anchors.ts`, `styles.css`, and admin `mapToPublicEventConfig`. With
  one template, the component is selected via the fallback, so correct rendering
  needed no registry/admin change. **Authoritative `theme_slug` selection (so the
  *right* template is chosen among several) is deferred to the multi-template /
  link phase** — until then a non-unique-muslim slug would wrongly fall back.
- **Verified by view:** public page + editor preview both render every section
  with saved content; default Italianno/EB-Garamond/Cinzel/Noto fonts apply;
  `npm run build` green.

### Explicitly NOT in Phase 0 (deferred to the link redesign below)
`link_id`, multiple links per event, per-day/segment RSVP, the semantic CSS-var
contract (only mattered for *sharing* sections — we're not), new tables/RPCs,
authoring new templates.

### Verify
`npm run build` green; the `unique-muslim` public page + admin theme preview
render identically — this is a refactor, not a behaviour change.

**Compare by VIEW, not by code.** The one-component collapse means the new code
won't match the old files line-for-line by design, so a code diff proves nothing.
The acceptance gate is a *visual + behavioural* match against a golden baseline
captured BEFORE the refactor: screenshot the published page (and the editor live
preview) across states — hero/loader, itinerary, RSVP form, RSVP success, deadline/
private-closed — then re-shoot the same views after and confirm they match
(layout, fonts, colours, animations, RSVP submit/edit/delete flow).

## The model in one line
> **A published page = one invitation *link*.** `/:slug/:link` renders that
> link's design + content + RSVP. `/:slug` redirects to the event's default link.

## Routing
- New: `/:slug/:link` → the link whose handle matches `:link`.
- `/:slug` → redirect (or render) the event's **default link** (first by order).
- **Reserved-word hazard:** `join` and `admin` are already `/:slug/*` siblings
  ([AppRoutes.tsx](../../../src/app/AppRoutes.tsx)). Link handles must be reserved
  against `join`/`admin` (and any future ones), **or** links live under a prefix
  (`/:slug/i/:link`). → *sub-decision: clean handle + reserved list, vs prefix.*

## Data model (high level — recommended shape)
A new **link spine** + extending the three things that are event-scoped today:

- **`event_links`** (new) — the spine. `id, event_id, handle (slug), title,
  anchor_day_id?, anchor_segment_id?, position, published_at`. The hard cap can
  mirror the `event_days` philosophy (links are cheap to render but capped to
  curb abuse) — *sub-decision: cap + tier-gate.*
- **`event_invitation`** — today one row per event (`UNIQUE(event_id)`). Becomes
  **per-link** (RSVP mode / deadline / limits / confirmation / config move to the
  link scope). Either add `link_id` + drop the unique, or fold these columns into
  `event_links`. → *sub-decision.*
- **`event_themes`** — gains `link_id`; "published" becomes per-link, not
  per-event. The editor/galleries already support multiple drafts; they get
  filtered by link.
- **`event_rsvps`** — gains `link_id` (and inherits the link's day/segment
  anchor). A guest can hold independent RSVPs across links. The guests page reads
  this new dimension to group/filter by link.

Alternative considered: brand-new parallel per-link tables leaving the event-level
ones as fallback. Rejected as two overlapping models to reason about — but flag if
the migration risk of reshaping `event_invitation` is too high.

## RPC changes (high level)
All currently event-scoped; become link-scoped (per the verify-latest-RPC rule,
each gets a timestamped migration + schema.sql sync):
- `get_public_invitation(slug)` → `get_public_invitation(slug, link_handle)`;
  returns the link's theme_slug + config + RSVP settings; resolves default link
  when handle omitted.
- `submit_rsvp` / `get_rsvp` / `update_rsvp` / `cancel_rsvp` → carry `link_id`.
- `create_theme` / `update_theme` / `publish_theme` / `delete_theme` → scoped to a
  link (gating stays `has_event_permission(event_id,'themes',<action>)`).
- New CRUD: `create_link` / `update_link` / `delete_link` (+ handle uniqueness per
  event, reorder), gated on the `invitation` (or `themes`) resource — *sub-decision.*

## The agnostic-template engine refactor (the code half)
Done **before** authoring templates so we author against the new foundation, and
`unique-muslim` is migrated onto it as the reference:
1. **Semantic CSS-var contract** — fixed vocabulary (`--theme-primary`,
   `--theme-fg`, `--theme-card`, `--theme-border`, font vars, …). Each template's
   `styles.css` only assigns these. Kills the per-template `--um-*` namespace.
2. **`<ThemeShell>` + `useThemeFonts`** — absorb the ~50 lines of font-link /
   style injection / root-var wiring currently copy-pasted in each
   [index.tsx](../../../src/pages/wedding/templates/unique-muslim/index.tsx).
3. **Shared `<ThemeRSVP>` section** — promote the 290-line RSVP state machine
   (closed/deadline/success/confetti/edit/delete) out of per-template
   [RSVP.tsx](../../../src/pages/wedding/templates/unique-muslim/RSVP.tsx); templates
   pass visual slots/classNames against the semantic vars (shared default + per-
   template overrides only).
4. **Registry integrity** — typed registry; a dev assertion that every DB
   `theme_slug` resolves to a registry entry; `FallbackTheme` → General/Western
   (not the Malay-Muslim design).
5. **Page context** — define `LinkPageContext` (the normalized props a template
   renders): event-level (couple names, palette, fonts) + link-level (handle,
   title, freeform content blocks, RSVP config) + guest RSVP state.

A template then shrinks to roughly: a `styles.css` (assign semantic vars), a
content schema (`types.ts`), a Hero, and any decorative flourish — everything else
shared.

## Open sub-decisions (resolve in the detailed-design pass)
1. Routing: clean handle + reserved-word list, vs `/:slug/i/:link` prefix.
2. Schema: `link_id` on `event_invitation` vs fold settings into `event_links`.
3. Reshape existing tables (recommended) vs new parallel per-link tables.
4. Link cap + which tier gates link count; which permission resource gates link
   CRUD (`invitation` vs `themes`).
5. Default-link resolution (first by position? an explicit `is_default`?).
6. Migration/back-compat: every existing event has one event-level invitation +
   theme today — backfill each into a single default link.
7. How much of the per-template content schema is shared vs template-specific
   (the freeform-content block model).

## Sequencing (proposed)
0. **Phase 0 — agnostic engine refactor** (above). Behaviour-preserving; ship +
   confirm the current page still works before anything else.
1. **Approve the link-redesign model** + resolve the sub-decisions above.
2. Backend: `event_links` + per-link reshape + RPCs (migrations + schema.sync),
   with a backfill of existing events into a default link.
3. Admin: per-link management in the invitation surface; guests page link
   dimension.
4. Author the culture templates against the new foundation.

> Note: the earlier "items 1–5 engine refactor" list was revised — the shared
> `<ThemeRSVP>` *section* and the semantic CSS-var contract are dropped in favour
> of the one-component-per-template shape (logic shared via `useRsvpSection`,
> markup per-template). See Phase 0.

## Out of scope (unchanged)
Billing / plan-gating enforcement; re-enabling signup. The image-upload work
(Storage bucket + uploader) already shipped in
`20260613000101_invitation_image_uploads.sql` and stands regardless.

---

### Appendix — engine audit (evidence)
- Per-template surface ≈ 15 files / ~600 lines, mostly structural duplication.
- `unique-muslim/index.tsx:41-90` — font/style injection infra, copy-pasted per
  template.
- `--um-*` CSS-var namespace forces `form.ts` (~75 lines) + `anchors.ts` to be
  re-authored per template.
- `RSVP.tsx` ~290 lines re-implemented per template (form itself is shared).
- `Itinerary.tsx:30-52` parses a freeform textarea; `get_public_invitation` does
  not return `event_segments` (PublicEventConfig has no segments) — invite is
  already decoupled from the ops timeline (consistent with the freeform decision).
- `wedding/index.tsx:50` silently falls back to `UniqueMuslim` for any unknown
  slug — wrong default for a multi-culture catalog; no guard that DB slugs have a
  registry entry.
- Three-places-must-agree coupling: registry entry (code) + field schema (code) +
  catalog row (`event_templates.config`, DB migration) drift silently.
