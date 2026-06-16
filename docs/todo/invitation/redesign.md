# Invitation redesign — per-day pages, draft/publish, private RSVP

> **Status:** plan for build (no code yet). Supersedes the earlier "free links"
> framing. Decisions below are **locked** from the design discussion; remaining
> forks are marked **⚠**. Branch: `refactor/invitation`. Phase 0 (agnostic engine
> + image uploads + curated fonts) already shipped on this branch.

## Scope
**This phase:** collapse `event_themes` into a per-day `event_invitation`;
draft/publish (1 draft + 1 published per page); private RSVP (phone-match); the
ripples that follow (per-page RSVP, per-day guest list); `/:slug/:day` routing;
**backfill** of existing events.

**Deferred (later sub-phases):** authoring the 5 culture templates; meta/OG edge
function; re-enabling signup.

## Migration strategy — expand → contract (no killing until go-live)
Build **additively**; do **all destructive work last** (just before go-live):
- New table is **`event_invitations`** (plural) — the merged design + settings model.
  The old `event_invitation` (singular) and `event_themes` stay **untouched** while
  we build, going dormant as code switches over.
- New RPCs / admin / public render target `event_invitations`; gated on the
  `invitation` resource. The `themes` resource lingers (unused) — not dropped yet.
- **No early backfill.** All current data is dev/test (no real customers yet), so
  instead of migrating it we **create a fresh invitation through the new flow,
  prefill it, and compare** against the old live page. A real production backfill,
  if ever needed, is a go-live concern. No read-fallback — old tables just go dormant.
- Template identifier column = **`template_key`** (the code-registry key, distinct
  from the event `slug`). `slug` is reserved for the event; the engine's
  template-`slug` (`config.slug`, registry keys, `theme_slug` payload) gets renamed
  to `template_key` too. `event_templates` gains a `template_key` column
  (`20260615000002`, seeded from `slug`); `slug` dropped at cleanup.
- **Deferred to a final "go-live cleanup":** backfill `event_invitation`(singular)
  → `event_invitations`(plural), then drop `event_invitation` + `event_themes`, and
  remove the `themes` resource. Nothing is dropped until then.

## The model
> **A published page = one `event_day`'s invitation.** `/:slug/:day` renders that
> day's page; `/:slug` → the event's default (first) day. Each page has its own
> design (template + content), its own RSVP settings, and its own RSVP
> submissions. Templates stay **code** (the registry); the DB stores
> `template_key` + config.

## Locked decisions
- Unit = `event_day` (+ optional `segment_id`, nullable) — reuse the hard-capped day spine.
- **Reshape** `event_invitation` to per-day (not a new table); **drop `event_themes`**.
- Keep `event_templates` as the readonly catalogue + default-content **seed**, with
  the seed **generated from the code registry** (no hand-written `{}` — that's what
  blanked pages in Phase 0). "Reset to template" re-copies the seed.
- **Draft/publish:** content flows `draft_config → published_config` (one each).
  **Settings** (mode / deadline / limits / confirmation) apply **live**, no publish.
- **Private mode = phone-match:** couple pre-loads guests (pending); the public RSVP
  asks for phone → matches a pending guest on that page → unlocks the RSVP.
- **RSVPs are per page; the guest list is per day.**
- Routing: clean `/:slug/:day` handle + reserved-word guard.
- **Backfill required** — real events exist and must survive.
- `unique-muslim` = private/bespoke → **template visibility flag** (not in the public catalogue).

## Data model
### `event_invitation` → per-day page
Today: one row/event (`UNIQUE(event_id)`), holds RSVP settings + `config.rsvp`.
Becomes one row per `(event, day[, segment])`:
- add `day_id uuid NOT NULL` FK `event_days`, `segment_id uuid NULL` FK `event_segments`
- drop `UNIQUE(event_id)`; add `UNIQUE(day_id)` (one page/day now; segment-split later)
- add `handle text` (URL slug, unique per event), `template_key text`,
  `draft_config jsonb`, `published_config jsonb`, `published_at timestamptz`
- keep `rsvp_mode`, `rsvp_deadline`, `guest_count_min/max`, `confirmation_message`,
  `config.rsvp` — now **per page**
- the old `event_themes` data folds into `template_key` + `draft/published_config`

### `event_rsvps` → per-page
- add `page_id uuid NOT NULL` FK (the `event_invitation` page)
- change `UNIQUE(event_id, phone)` → `UNIQUE(page_id, phone)` (phone still nullable,
  NULLs distinct) — so one guest can RSVP to multiple days
- existing rows backfilled to the default page

### `event_templates`
- add `is_listed boolean` (catalogue visibility); `unique-muslim` → `false`
- `config` seeded from the code registry, not hand-written

## Backfill (existing events)
For each event, create one page on the **default (first-by-date) day**, carrying:
- `template_key` + `published_config` from the event's published theme,
- `draft_config` = the latest draft theme's config (or same as published),
- RSVP settings copied from the old per-event `event_invitation`,
- `handle` derived from the day's label (fallback `"main"`),
- `published_at` preserved if a theme was published.
Repoint existing `event_rsvps.page_id` to that default page, then drop `event_themes`.

## Routing
- `/:slug/:day` → page by handle; `/:slug` → default day's page.
- Reserved handles: `join`, `admin` (+ future `/:slug/*` siblings) — validated on create.

## RPCs (each = timestamped migration + `schema.sql` sync; `SECURITY DEFINER`)
- `get_public_invitation(slug, day_handle DEFAULT null)` → page config + RSVP settings; resolves default when omitted.
- `create_page` / `update_page` / `publish_page` / `reset_page` (→ seed) / `delete_page` — handle uniqueness + reserved-word check; gated on `themes`.
- Fold `update_theme`/`publish_theme`/`create_theme` into the page RPCs.
- RSVP RPCs (`submit`/`get`/`update`/`cancel`) gain page scope; `submit_rsvp` honours private mode (match a pending guest by phone on that page).

## Admin UI
- Invitation surface → **per-day pages**: pick a day, edit its page (the existing
  editor, now scoped to a page), draft/publish controls, reset-to-template.
- Guests page → **per-day**: RSVPs grouped/filtered by day/page.
- Per-page private-mode toggle; pre-load the pending guest list per page.

## Sequencing — step by step, **public first**
Each step is its own shippable unit (own migrations + verify-by-view). RSVP stays
**public** until Step 4.

**Step 1 — Create `event_invitations` (merged, parallel) + backfill.** New plural
table holding `template_key` + design config + its own RSVP config, **one row per
event** for now (`day_id`/`segment_id` added nullable+unused; `UNIQUE NULLS NOT
DISTINCT (event_id, day_id, segment_id)` enforces one-per-event today, one-per-day
once `day_id` is populated in Step 3). Point new CRUD invitation RPCs + the admin
editor + a new public render at it, gated on the **`invitation`** resource; **create
a fresh invitation and compare to the old live page** to validate. Everything old
(`event_invitation`,
`event_themes`, `_rsvp` RPCs, `create_event`'s auto-upsert) stays **live and
untouched** — no live risk — and is killed only in cleanup. Still public RSVP, no
draft/publish yet.

**Step 2 — Draft/publish.** Add `draft_config` + `published_config` (one each) to
the merged invitation; editor gets draft/publish (+ reset-to-template); the public
page renders `published_config`. Editing the draft never touches live.

**Step 3 — Per invitation link (per-day).** Add `day_id` (+ nullable `segment_id`),
one page per day, `/:slug/:day` routing + default-day, `event_rsvps` per-page
(`UNIQUE(page_id, phone)`), guests admin grouped per day.

**Step 4 — Private mode (phone-match), LAST.** Pre-loaded pending guest list per
page; public RSVP matches a pending guest by phone to unlock.

**Go-live cleanup (LAST, destructive).** Drop `event_invitation` + `event_themes`;
remove the `themes` resource from `event_resources`, the `create_event` seeds, and
existing `event_access_groups.permissions`. (Backfill already happened early in
Step 1 — only the drops remain.)

> Then (later): author the 5 culture templates; meta/OG edge function.

## Deferred guards & cleanup (tracked from the RPC review)
- **`create_event`** still runs `INSERT INTO event_invitation (event_id)` — the OLD
  singular row the **guests** feature reads. Leave it; **drop that INSERT at cleanup**.
  New events stay explicit-create for `event_invitations` (no auto-seed).
- **Template reuse (Step 3):** the same `template_key` may back multiple days —
  uniqueness is per `(event_id, day_id, segment_id)`, **not** per template. Do NOT
  add a template-dedup guard. "Add invitation" becomes pick-a-day + any template
  (reuse allowed). In Step 1 it's one-per-event, so a 2nd create hits the
  per-event "already exists" guard.
- **`event_invitations.day_id`** is `ON DELETE CASCADE` now (always NULL in Step 1).
  **Step 3:** flip to `ON DELETE RESTRICT` and guard invitations in `delete_day`
  (settings) so a day with an invitation can't be silently deleted.
- **`delete_invitation`:** published-row guard done (= live page). **Step 3:** also
  block when the invitation has RSVPs (per-page RSVP).
- **`update_invitation`:** `min ≤ max` done. **Step 2:** draft-vs-published editing
  buffer (edit the draft, not the live config).
- **Publish / unpublish (Step 2):** publish sets `published_at`; **unpublish** (couples
  taking the page down after the event) clears it. `delete_invitation` already blocks
  published rows, so the takedown flow is **unpublish → delete**.
- **`create_invitation` seeding (DECIDED):** copy `theme_config` from the template's
  **base config** (`event_templates.config`) on create — so a sensible preview shows
  before selecting and the new invitation starts populated. Populate a good base
  config per template first (today it's empty → new invitations came up null).
- **Query keys (Step 3 / cleanup):** collapse the parallel `eventInvitation` key back
  into `invitation` (kept separate now only because **guests** still read the old
  `event_invitation` via `invitation`). Key by `day_id`/`segment_id` once per-day lands
  — improve the original, don't keep two.
- **"Add invitation" card:** keep as-is in Step 1 (forward affordance); fix the
  one-per-event dead-end in Step 3 (becomes pick-a-day + template).

## ⚠ Open sub-decisions
- Backfill: default day = first-by-date (recommended) vs an explicit flag.
- Handle source: derived from `event_days.label` (recommended) vs a couple-editable field.
- One page per day now (`UNIQUE(day_id)`); same-day multi-page (segment split) deferred — confirm not needed this phase.
- Guests admin: grouped-by-day view vs per-page tabs.
- Private mode: a matched guest **updates** their pending row (recommended) vs creates a linked row.

## Deferred / out of scope
5 culture templates (authored against this foundation); meta/OG edge function; signup re-enable.
