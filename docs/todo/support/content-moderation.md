# Content moderation — staff console (v1)

> **Status:** planned, not built. This is the design for the first tenant of an
> internal staff/support console: reactive moderation of event slugs/names.

## Goal & non-goals

**Goal.** Give Hitchy Stitchy *staff* (not event members) a way to find and
neutralise offensive events — bad slug, bad event name, bad content — without
adding friction to the 99% of legitimate users.

**Non-goals (v1).** No refunds/billing support, no account management, no general
helpdesk. Those are future tenants of the same `/internal` console. Build the
moderation slice first; design the namespace so the rest can slot in.

## The model

**Default-allow, reactive.** Events are never gated at creation or publish.
Everything flows; staff *review and act* only on offenders. The hard-blocking of
obviously-offensive slugs already happens at creation via `slug_reservations`
(the ~988 reserved words; see [reserved-slugs](../../architecture/reserved-slugs.md)).
This console handles what slips through — embedded/obfuscated profanity, offensive
names, reported content.

**Tri-state review.** A nullable `slug_approved` on `events`:

| value | meaning | effect |
| --- | --- | --- |
| `NULL` (default) | unreviewed | **allowed** (no gate) — sits in the worklist |
| `true` | reviewed, OK | allowed |
| `false` | blocked | **public page hidden** |

Enforcement keys **only on `= false`**, so the default (`NULL`) never gates
anyone. Nothing requires the null queue to be cleared for the app to work — it's
just the staff worklist.

## Routing & namespace

All internal/company/staff tooling lives under **`/internal/**`** — unambiguous
("not for users"), and roomy for future support tenants. `internal`, `platform`,
`console` (+ the moderation/ops vocabulary) are reserved in
`20260629000004_reserve_internal_route_slugs.sql`.

- Console root: `/internal`
- This feature: **`/internal/moderation/slugs`** (the `/slugs` leaf leaves room
  for `/internal/moderation/{names,images,text}` later).

## Platform-staff identity (the foundation)

Today's `useAccess()` / super-admin is **event-scoped** (the couple). Staff is
**platform-scoped** — can see/act on *every* event — so it must be server-enforced;
client gating is UX only (same rule as the rest of the app).

- **`platform_staff`** table: `user_id` (PK/FK), `role` (e.g. `moderator`/`admin`),
  `created_at`.
- **`is_platform_staff()`** SQL helper (SECURITY DEFINER): used in RLS policies and
  in every staff RPC. Single source of truth for "is this caller staff".
- Client: a thin `useStaff()`-style gate for routing/visibility, **never** the real
  boundary.
- `/internal/**` routes sit behind a staff gate that redirects non-staff away
  (mirror the `AuthGate` → `/login` pattern).

## Data model

On **`events`** (additive, append-only migration):

- `slug_approved boolean` — nullable, default `NULL` (tri-state above).
- `block_reason text` — why it was blocked (shown to owner / kept for the record).
- `blocked_by uuid` — staff actor.
- `blocked_at timestamptz` — when.

New table from the section above: **`platform_staff`**.

> **Audit log — deferred.** The columns above hold only *current* state; a
> block→unblock→re-block loses history. When there's a second moderator or
> disputes arise, add an append-only `moderation_actions` (event, actor, action,
> reason, at). Not in v1.

## Server (RPCs, all gated on `is_platform_staff()`)

- `staff_set_event_review(p_event_id, p_approved boolean, p_reason text)` — set
  `slug_approved` + reason/by/at. `false` blocks, `true` clears, used for both.
- `staff_list_events(p_filter, p_search, …)` — the queue: filter by
  `unreviewed | approved | blocked | all`, search by slug/name, paginated.
- (Optional) on block, also drop a permanent `slug_reservations` row for the
  offending slug so a forced rename can't re-grab it.

## Enforcement

- **Public render gate:** `get_public_invitation` gains one condition — if the
  event's `slug_approved = false`, return "not found". ⚠️ **Live-RPC edit → STOP
  gate**: explicit ack before touching it.
- **Realtime (mirror member freeze).** The freeze pattern is `frozen_at` +
  a row subscription that re-bootstraps the client instantly
  ([useAdminRealtime.ts](../../../src/pages/admin/bootstrap/hooks/useAdminRealtime.ts),
  [MemberFreezeModal.tsx](../../../src/pages/admin/members/modals/MemberFreezeModal.tsx)):
  - **Owner's admin** — easy mirror: event row changes → re-bootstrap → show
    "your event was blocked, contact support" with the right messaging.
  - **Public viewer** — anon, so true live-push needs anon realtime/RLS thought.
    **v1: hard-block on next load** (instant for any new visitor); live-push to an
    already-open anon page is a fast-follow.

## Moderation queue (UI)

`/internal/moderation/slugs`:

- Filter tabs: **Unreviewed (null) · Approved · Blocked · All** — default
  Unreviewed.
- Search by slug / event name.
- Row → event detail: slug, name, owner, dates, a peek at the invitation, and
  **Block / Approve** actions (block requires a reason).
- Block/Approve uses a `ConfirmAlertModal` (reuse the freeze modal shape).

## Build order

1. **Platform-staff identity** — `platform_staff` + `is_platform_staff()` + the
   `/internal` staff route gate. (Foundation; everything depends on it.)
2. **Data model** — `slug_approved` + reason/by/at on `events` (default-true-flow
   preserved; existing rows default `NULL` = allowed).
3. **Staff RPCs** — `staff_set_event_review`, `staff_list_events`.
4. **Render gate** — `get_public_invitation` block condition. *(STOP gate.)*
5. **Dashboard UI** — queue + filters + detail + actions, behind the staff gate.
6. **Realtime** — owner-side freeze-mirror first.

## Fast-follows (post-v1)

- `moderation_actions` audit log.
- **User reports** — public "report this page" → `event_reports` feeds the queue.
- **Phase 4 soft-flag feed** — the slug profanity normaliser flags borderline
  slugs that *passed* creation straight into this queue (moderation + the
  profanity checker become one system).
- Public-viewer live block-push.
- Moderation of other content types (`/internal/moderation/{names,images,text}`).

## References

- [reserved-slugs.md](../../architecture/reserved-slugs.md) — the reservation
  mechanism + THE RULE.
- Reserved internal routes: `20260629000004_reserve_internal_route_slugs.sql`.
- Freeze pattern to mirror: `useAdminRealtime.ts`, `MemberFreezeModal.tsx`.
- Auth gate pattern: [auth.md](../../architecture/auth.md).
- Access boundary rule (server is real, client is UX): `CLAUDE.md` §Access.
