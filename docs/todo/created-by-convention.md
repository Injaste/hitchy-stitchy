# Handover — `created_by` on `event_gifts` (and the wider convention)

**Status:** deferred. `created_by` **stays on `event_gifts` for now.** This doc is
to decide/act on it separately.

## Current state (verified from `schema.sql`)
`created_by` is **not** a blanket convention — it's only on tables where the
creator actually matters:

| Has `created_by` | Why it's there | Lacks `created_by` |
|---|---|---|
| `events` | the event owner | `event_timelines` |
| `event_tasks` | permissions ("manage tasks you created/are assigned to") | `event_rsvps` (guests) |
| `event_announcements` | attribution (who posted) | `event_budget` (cap table) |
| `event_expenses` | audit trail | `event_days` / `event_segments` |
| `event_gifts` | copied from `event_expenses` (its closest analog) | `event_invitation` / `event_settings` |

## The open question
Should `created_by` stay on `event_gifts`?
- **Pro-keep:** mirrors `event_expenses` 1:1 (gift rows = expense rows); free
  audit trail; harmless (nullable, FK → `event_members` `ON DELETE SET NULL`,
  set by `create_gift`).
- **Pro-drop:** gifts are **super-admin only** → the creator is always the
  couple (2–3 people) → audit value is thin; the FE never displays it;
  `event_timelines` / `event_rsvps` omit it.

## If you DROP it (table isn't live yet — just edit the pending migration)
All backend; the FE needs **no** change (`created_by` is not in the `Gift` type,
`GIFT_FIELDS`, or any component — confirmed).
1. `supabase/migrations/2026/06/13/20260613000002_gift_envelopes.sql`:
   - delete the `created_by uuid,` column line;
   - delete the `event_gifts_created_by_fk` constraint;
   - in `create_gift`: drop `created_by` from the INSERT column list and
     `v_caller.id` from VALUES. **Keep `v_caller`** — it's still needed for the
     `is_super_admin(v_caller)` check; just don't insert it.
2. `supabase/schema.sql`: the same three edits (table column, FK, `create_gift`).

## If you KEEP it
Nothing to do — already in place as described above.

## Wider (optional) cleanup
The real decision is a convention: *"every user-authored row gets `created_by`"*
vs *"only where functionally used."* Today it's the latter (ad hoc). Standardising
would mean either adding it to `event_timelines`/`event_rsvps` or removing it from
`event_expenses`/`event_gifts` — a bigger, separate refactor. Only worth it if a
concrete need appears (per-row attribution or permissions). Not recommended now.
