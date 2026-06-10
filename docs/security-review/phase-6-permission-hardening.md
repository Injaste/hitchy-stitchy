# Phase 6 — Permission-system hardening (hardest — do last, do carefully)

**Effort:** high — live migrations against the access-control core; a mistake
here locks every member out of every event, so this wants a calm week, a
staging pass, and a regression sweep of the whole permission matrix.
**Impact:** medium *likelihood* (nothing here is exploitable today without a
second bug) but **high blast radius** — these are the defense-in-depth gaps in
the system everything else trusts. Do [phase 4](phase-4-schema-source-of-truth.md)
first so the snapshot you're editing against is true.

## 1. `has_event_permission` trusts `access_group_id` across events
Live body (migration `20260605000001_collapse_access_three_level.sql:37-39`):

```sql
SELECT ag.permissions ->> p_resource INTO v_level
FROM event_access_groups ag
WHERE ag.id = v_caller.access_group_id;     -- no event check
```

`v_caller` is correctly scoped to `p_event_id`, but the group lookup isn't —
if a member row ever points at *another event's* group, that event's
permission levels apply. Today that requires a buggy write path (the
`update_member_access_group` body lives only in the live DB — phase 4 item 2
makes it reviewable), but the helper is one line away from making the whole
class impossible:

```sql
WHERE ag.id = v_caller.access_group_id
  AND ag.event_id = p_event_id;
```

Falls through to `v_level IS NULL → false` — fail-closed. Ship as a migration
re-pasting the full function (and sync `schema.sql`, per phase 4's rule).

## 2. Composite FK: `event_members.access_group_id`
`supabase/schema.sql:127` — the FK references `event_access_groups (id)` only,
so the cross-event pointer in item 1 is *representable* at the DB layer.
Make it unrepresentable:

```sql
ALTER TABLE event_access_groups
  ADD CONSTRAINT event_access_groups_event_id_id_key UNIQUE (event_id, id);
ALTER TABLE event_members
  DROP CONSTRAINT <current fk name>,
  ADD CONSTRAINT event_members_access_group_fk
    FOREIGN KEY (event_id, access_group_id)
    REFERENCES event_access_groups (event_id, id);
```

**Pre-flight on live data:** `SELECT m.id FROM event_members m JOIN
event_access_groups ag ON ag.id = m.access_group_id WHERE ag.event_id !=
m.event_id;` must return zero rows before adding the constraint. Note
`access_group_id` is nullable (pending invites) — composite FKs with one NULL
column pass by default (`MATCH SIMPLE`), which is the desired behavior here.
Item 1 alone is sufficient protection; this item makes it structural. Skippable
if the FK churn feels risky — but then item 1 is mandatory.

## 3. Pin `search_path` on all SECURITY DEFINER functions
Zero functions in the repo set `search_path`
(`grep -rn "search_path" supabase/` → no hits). Standard Supabase linter
finding (`function_search_path_mutable`): a SECURITY DEFINER function
resolving unqualified names through a mutable search_path is a privilege-
escalation vector if any role ever gains CREATE on a schema in the path.
Low exploitability on default Supabase grants — but it covers *every*
privileged function including `get_current_member`, `has_event_permission`,
and all write RPCs.

**Fix:** one migration re-pasting each SECURITY DEFINER function with
`SET search_path = public` in its header (the bodies use unqualified
`public.*` and `auth.uid()` — `auth.uid()` is already schema-qualified, so
`= public` is sufficient and avoids touching every identifier; `= ''` would
require schema-qualifying everything). ~20 functions in the repo **plus** the
live-only ones from phase 4 — which is why phase 4 must land first, otherwise
this migration can't cover them and the linter warning stays half-fixed.

## 4. (Optional, while in the RPCs) existence-before-permission ordering
`update_expense` / `delete_expense` (migration
`20260610000001_budget_tracker.sql:259-275, 312-328`) check the row exists and
belongs to the event *before* checking membership/permission, so error
messages distinguish "not found" vs "wrong event" vs "no permission" to any
authenticated caller. UUIDs are unguessable, so this leaks ~nothing — note it
as a convention decision (membership check first is the cheaper habit) rather
than a required fix.

## Verification (regression-sweep the matrix — do not skip)
On staging (or a throwaway event on prod) with three users — root/couple,
Admin-group member, Team-group member:
- Team: can read/write timeline + tasks, can read members, **cannot** see
  budget (RLS returns zero rows), cannot call budget/guests/invitation RPCs.
- Admin: full on everything granted, `access` read-only.
- Couple/root: unaffected (superadmin bypass short-circuits before the group
  lookup — item 1 cannot lock them out).
- Pending member (NULL `access_group_id`): can still be invited/claimed
  (composite-FK NULL behavior, item 2).
- After item 3: every RPC still runs (a typo'd `SET search_path` shows up as
  instant "function X does not exist" errors — test one write per feature).
- `npm run build` is irrelevant here; this phase is DB-only. The frontend
  needs zero changes.
