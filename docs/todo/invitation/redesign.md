# Invitation redesign — remaining work

> **Status:** the redesign is **built and live.** Phase 0 + Steps 1–3 shipped, and
> the go-live RPC cutover is done — the `_v2` functions were promoted to the
> canonical base names (`get_public_invitation`, `submit_rsvp`, `update_rsvp`,
> `create_guests`, `update_guest`) in migration `20260617000007`, so production
> runs on the new per-(day, segment) model. What's left, in order:
> **(1) old-model cleanup**, then **(2) Step 4 — private mode.**
>
> The full build history (model, data model, routing, slices, hub/guests UI,
> resolved forks) lived here previously; it's in git if needed.

## 1. Go-live cleanup (do first — destructive)
The new model is live and nothing reads the old tables anymore, so these drops are
the remaining tail. Each = a timestamped migration + `schema.sql` sync; confirm no
RPC/view still references a target before dropping it.

- **Drop `event_invitation` (singular) + `event_themes`** — superseded by
  `event_invitations` (plural).
- **Remove the `themes` resource** — from `event_resources`, `create_event`'s seeds,
  and existing `event_access_groups.permissions`.
- **Drop `create_event`'s legacy `INSERT INTO event_invitation (event_id)`** — the
  old singular row the guests feature used to read. New events explicit-create
  `event_invitations` (no auto-seed).
- **Drop `event_templates.slug`** — superseded by `template_key`.
- **Frontend:** remove the now-unused `useInvitationQuery` / `fetchInvitation` (the
  old singular `event_invitation` reader) and collapse the parallel `eventInvitation`
  query key back into `invitation`.

## 2. Step 4 — Private mode (phone-match)
Pre-loaded pending guest list per page; the public RSVP asks for a phone number,
matches a pending guest on that page, and unlocks the RSVP. `submit_rsvp` honours
private mode (match a pending guest by phone on that page). Admin gets a per-page
private-mode toggle + pre-loads the pending guest list per page.

**Still open:** a matched guest **updates** their pending row (recommended) vs.
creates a linked row.

## Deferred / later (not Step 4)
- **Link-count health cap** (per-event invitations / per-day segments) —
  abuse/cost-driven, not monetization; number TBD; mirrors the days hard-cap. Days
  are hard-capped but segments are currently uncapped, so link count scales with
  segments (small in practice).
- **5 culture templates** — content/authoring effort; see [templates.md](templates.md).
- **meta/OG edge function**; **signup re-enable**.
