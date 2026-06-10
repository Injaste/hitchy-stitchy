# Data access (reads / the RLS boundary)

`useAccess()` is the client gate, but it's **UX only — RLS + RPCs are the real
boundary** (see [auth.md](auth.md)). This is the read-side counterpart to
[mutations.md](mutations.md) (writes).

## RLS gates rows, not columns

A SELECT policy returns one boolean **per row** — show the whole row or hide it;
it can't null out a column. A table carries **one SELECT predicate per command**.
Everything below follows from that single fact.

## Pick the read shape

| Situation | Pattern |
|---|---|
| Visible to every member | RLS row-gate `is_event_member(event_id)`. |
| Whole row is all-or-nothing for a permission | **RLS row-gate**: `USING (is_event_member(event_id) AND has_event_permission(event_id,'<res>','read'))` — mirror `event_rsvps_select`. No RPC. |
| Mix of shared + gated columns | **Don't co-locate** — split by read-tier (rule below). |
| One sensitive field welded to a row you must serve everyone | **Field-redaction** — `SECURITY DEFINER` RPC building JSON with `CASE WHEN has_event_permission(...) THEN col END` (`get_members` → email), or a masking view. |

Default to the row-gate. Reach for redaction only when the last row applies.

## One table = one read-tier

Group columns by **who can read them**; each group is its own table with its own
predicate.

- **Permissions → tables is one-to-many.** One permission can own several tables
  (`budget` gates `event_budget` + `event_expenses`); many tables share the
  all-member gate (`event_settings`, `event_timelines`, `event_tasks`).
- **Never put two read-tiers in one row** — RLS can't gate them separately.
  Dropping a `budget:read` field onto all-member `event_settings` would force a
  masking view to hide one number; a tiny `CREATE TABLE` is cheaper and keeps
  realtime / PostgREST native.
- **AVOID** a shared `feature_details` table for multiple gated features — one
  predicate can't gate budget + ang bao + vendor each by its own resource.

Sort test, per column: *"Should a member **without** `<res>:read` see this?"*
Yes → all-member table. No → the feature's own gated table.

## When a GET becomes an RPC

Only for **field-redaction** or **reshaping/aggregation** (embeds, role-filtered
rows) — e.g. `get_members`. The cost: you lose PostgREST filter/paginate/embed
and **realtime** (`postgres_changes` subscribes to tables, not RPCs). Don't
reflexively convert reads to RPCs.

A redacting RPC/view only works if you **also lock the base table's direct
SELECT** (own-row policy or column `REVOKE`) — otherwise callers skip it and read
the table directly, and the redaction is theater. `event_members` SELECT is
scoped to `user_id = auth.uid()` for exactly this reason.

## Current map

| Tier | Tables | Gate |
|---|---|---|
| All-member | `event_settings`, `event_timelines`, `event_segments`, `event_days`, `event_tasks`, `event_themes`, `event_invitation` | `is_event_member(event_id)` |
| `guests:read` | `event_rsvps` | `… AND has_event_permission(…,'guests','read')` |
| `budget:read` | `event_budget`, `event_expenses` | `… AND has_event_permission(…,'budget','read')` |
| Self-only (list via redacting RPC) | `event_members` → `get_members` | `user_id = auth.uid()` |

> `event_timelines` / `event_tasks` are membership-gated today; adding their
> `timeline` / `tasks` read-gate is a pending defense-in-depth retrofit (both
> default groups already grant those, so nothing leaks now).
