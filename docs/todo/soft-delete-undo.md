# Handover — Soft-delete + Undo

Self-contained brief for picking up the **undo-on-delete** feature. The terse
architecture note lives in [docs/architecture/destructive-actions.md](../architecture/destructive-actions.md);
this is the detailed implementation plan.

## Status

- **Shipped:** type-to-confirm on the high-stakes deletes (member, theme) via
  `ConfirmAlertModal`'s `confirmPhrase`. All deletes are currently **immediate**
  `useMutation` calls (hard delete on confirm).
- **Not built (this doc):** the undo grace period.
- **Abandoned approach:** a client-side 7s `setTimeout` that deferred the real
  RPC. Dropped because anything that kills the tab before the timer fires (tab
  close, crash, power loss, logout, offline) **silently loses the delete** — the
  optimistic removal was in-memory only and React unmount-cleanup doesn't run on
  page teardown. Don't revive it; use server-side soft-delete instead.

## Goal & locked decisions

- **Soft-delete is server-side and immediate.** On confirm, the RPC sets a
  `deleted_at` marker (durable at once), so close/crash/logout no longer lose it.
  Undo is a `restore` RPC. A pg_cron reaper hard-deletes expired rows later.
- **Undo applies to all five deletes:** guest, task, timeline, member, theme.
  (Not `archive_tasks` / `freeze_member` — already reversible. Not `cancel_rsvp`
  — guest-facing, separate.)
- **Per-table RPC pairs**, not a generic `soft_delete(table, …)`. The plumbing
  (`SET deleted_at`) is generic, but the **authorization is per-table** (task
  creator-override, member rank/super-admin protections, theme uses the
  `invitation` resource), and a table-name argument means dynamic SQL + an
  allowlist. Keep authz explicit and colocated.
- **The existing `delete_x` RPCs become reaper-only purges.** Strip their auth
  checks (cron has no `auth.uid()`), keep the cascade, and revoke `EXECUTE` from
  the API roles. Authz moves to the user-facing `soft_delete_x` / `restore_x`.
- **Cascades happen at purge, not at soft-delete** — so Undo is lossless (e.g.
  don't strip a member off task assignees until the row is actually purged).
- **Rides `useMutation` cleanly:** client side is two ordinary mutations
  (`softDelete` + `restore`) + an undo toast. No client timer.

## Architecture

```
confirm ─▶ soft_delete_x()  ── sets deleted_at, row hidden immediately
             │
             ├─ optimistic remove from list cache + toast "Deleted X · Undo"
             │
   Undo ─────┴─▶ restore_x()  ── clears deleted_at, row reappears
             │
   (no undo) ──▶ pg_cron reaper (hourly) ─▶ delete_x() [internal] ─▶ hard DELETE + cascade
```

## The RPCs — worked example: member

Member is the richest case (access-bearing + an `assignees` cascade). Model the
authz on the in-repo `freeze_member` (migration `20260605000001`).

**Column + indexes**
```sql
ALTER TABLE event_members ADD COLUMN deleted_at timestamptz;
CREATE INDEX event_members_active_idx ON event_members (event_id) WHERE deleted_at IS NULL;
-- Recreate any membership-identity unique (e.g. (event_id, user_id)) as partial,
-- so a soft-deleted member doesn't block re-inviting the same person:
-- CREATE UNIQUE INDEX ... ON event_members (event_id, user_id) WHERE deleted_at IS NULL;
```

**`soft_delete_member` — frontend-callable, carries the authz**
```sql
CREATE OR REPLACE FUNCTION public.soft_delete_member(p_event_id uuid, p_id uuid)
RETURNS event_members LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_target event_members; v_caller event_members; v_member event_members;
BEGIN
  SELECT * INTO v_target FROM event_members
  WHERE id = p_id AND event_id = p_event_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;

  IF is_super_admin(v_target) THEN RAISE EXCEPTION 'This member cannot be removed'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'members', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to remove members'; END IF;
  IF v_caller.id = p_id THEN RAISE EXCEPTION 'You cannot remove yourself'; END IF;
  IF get_member_rank(v_caller) >= get_member_rank(v_target) THEN
    RAISE EXCEPTION 'You do not have sufficient rank to remove this member'; END IF;

  UPDATE event_members SET deleted_at = now() WHERE id = p_id RETURNING * INTO v_member;
  RETURN v_member;
END; $$;
```

**`restore_member` — the Undo target**
```sql
CREATE OR REPLACE FUNCTION public.restore_member(p_event_id uuid, p_id uuid)
RETURNS event_members LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_caller event_members; v_member event_members;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'members', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to restore members'; END IF;

  UPDATE event_members SET deleted_at = NULL
  WHERE id = p_id AND event_id = p_event_id AND deleted_at IS NOT NULL
  RETURNING * INTO v_member;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member not found or already restored'; END IF;
  RETURN v_member;
END; $$;
```

**`delete_member` → internal purge (reaper-only)**
```sql
-- INTERNAL ONLY. No auth context (cron). Cascade lives here, runs at purge.
CREATE OR REPLACE FUNCTION public.delete_member(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- assignees is uuid[] on both tables (schema.sql); scrub the member id out.
  UPDATE event_tasks     SET assignees = array_remove(assignees, p_id)
    WHERE event_id = p_event_id AND p_id = ANY(assignees);
  UPDATE event_timelines SET assignees = array_remove(assignees, p_id)
    WHERE event_id = p_event_id AND p_id = ANY(assignees);
  DELETE FROM event_members WHERE id = p_id;
END; $$;

REVOKE EXECUTE ON FUNCTION public.delete_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
```

## The other four tables

Same shape (`soft_delete_x` / `restore_x` + internal purge), differing in authz,
cascade, and cache. Key per-table notes:

| Table | Resource (authz) | Realtime? | Cascade at purge | Cache shape |
|---|---|:--:|---|---|
| `event_members` | `members` | no | scrub `assignees` (tasks + timelines) | `Member[]` |
| `event_guests` | `guests` | **yes** | FK (RSVP rows) | `Guest[]` |
| `event_tasks` | `tasks` (+ creator-override) | no | FK; also remove id from `task_order` | active `Task[]` + `task_order` + archived `Task[]` |
| `event_timelines` | `timeline` | **yes** | FK | grouped `TimelineGrouped` |
| `event_themes` | `invitation` | no | FK | `Theme[]` (currently invalidate-based) |

- **Tasks:** delete path touches three caches and the board order is derived from
  `task_order`. The internal purge can just `DELETE` (FK cascade); `task_order`
  cleanup already happens in the current `delete_task` body — keep it.
- **Themes:** the current mutations invalidate rather than `setQueryData`; soft-
  delete/restore should `setQueryData` on `adminKeys.themes(slug)` for snappy UX.

## Database-wide work (the "soft-delete tax")

1. **Filter `deleted_at IS NULL` on every read** — admin fetches (`fetchGuests`,
   `fetchTasks`, `fetchTimeline`, `fetchMembers`, `fetchThemes`), RLS policies,
   any count/aggregate RPC, and the **guest-facing** wedding pages that read
   guests/timeline.
2. **Realtime (guests + timeline).** A soft-delete arrives as an **UPDATE**
   (`deleted_at` set), not a DELETE — the handlers in `guests/queries.ts`
   (`useGuestsRealtime`) and `timeline/queries.ts` (`useTimelineRealtime`) must
   treat "`deleted_at` set" as a removal and "cleared" as a re-add. The reaper's
   hard delete still arrives as a normal DELETE.
3. **Partial unique indexes** `… WHERE deleted_at IS NULL` for every uniqueness
   that a lingering soft-deleted row could block (re-invite, re-create theme, …).
4. **Member access gotcha (critical).** `event_members` is access-bearing. A
   soft-deleted member is still physically present, so `get_current_member` /
   `has_event_permission` must treat `deleted_at` like the existing `frozen_at`
   (`… AND frozen_at IS NULL AND deleted_at IS NULL`), or a "removed" member keeps
   access until the reaper runs.

## The reaper (pg_cron)

Per-row loop so one poison row can't roll back the batch — each iteration's
`BEGIN … EXCEPTION` is a subtransaction. The `now() - interval '10 seconds'`
margin keeps the reaper from racing a just-clicked Undo. Hourly is fine (rows are
hidden immediately; physical purge lag is invisible).

```sql
CREATE OR REPLACE FUNCTION public.purge_expired() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE r record;
BEGIN
  FOR r IN SELECT event_id, id FROM event_members
           WHERE deleted_at < now() - interval '10 seconds' LOOP
    BEGIN
      PERFORM delete_member(r.event_id, r.id);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'purge member % failed: %', r.id, SQLERRM; -- skip, retry next run
    END;
  END LOOP;
  -- repeat the block per table (guests, tasks, timelines, themes)
END; $$;

REVOKE EXECUTE ON FUNCTION public.purge_expired() FROM PUBLIC, anon, authenticated;
SELECT cron.schedule('purge-expired', '0 * * * *', 'SELECT public.purge_expired()');
```

## Client: the undo-button logic

Per [mutations.md](../architecture/mutations.md): cache → query hook, toast/UI → call
site. Two ordinary `useMutation` calls per feature:

- **`softDelete`** — optimistic-remove the row from the list cache; RPC sets
  `deleted_at`; `onError` rolls the row back. Replaces the current `remove`.
- **`restore`** — optimistic re-add; RPC clears `deleted_at`.

The **undo button** is a sonner toast raised at the call site (the delete modal's
confirm handler), e.g.:

```ts
const handleConfirm = () => {
  softDelete.mutate(item);          // optimistic hide + persist deleted_at
  closeAll();
  toast("Deleted \"" + item.name + "\"", {
    action: { label: "Undo", onClick: () => restore.mutate(item) },
  });
};
```

Notes:
- **No client timer.** The soft-delete already persisted; the toast's only job is
  to surface Undo. Its duration is just how long the affordance shows (~5–7s);
  the row stays recoverable server-side until the reaper runs, so a slow Undo
  isn't fatal (a future "trash" view could expose that longer window).
- A small shared helper (`softDelete` + optimistic remove + the undo toast +
  `restore`) is worth extracting once 2+ features use it — but as plain mutations,
  not the abandoned timer-based `useUndoableDelete`.
- Re-checking permission on `restore` is intentional (the user might no longer be
  allowed) — surface its error via the normal toast path.

## Scope & open decisions

1. **All five at once, or member + theme first?** The DB tax (filters, RLS,
   realtime, indexes) is per-table; staging by table is fine.
2. **Column semantics.** This doc uses `deleted_at = now()` + reaper grace in the
   `WHERE`. Alternative: store `now()+10s` and reap `WHERE deleted_at < now()` —
   equivalent, but a future timestamp in a column named `deleted_at` reads oddly.
3. **Retention / cadence.** 10s margin + hourly purge here. Lengthen retention if
   you want a recoverable "trash" view; tighten the cron if storage matters.
4. **Generic vs per-table** — settled on per-table (authz), but revisit if a 6th+
   table makes the boilerplate hurt.

## Guardrails & grounding

- Per `CLAUDE.md`: every backend change is a timestamped migration in
  `supabase/migrations/`; update `supabase/schema.sql` to match. Client gating is
  UX only — these RPCs (RLS + the `soft_delete_x` authz) are the real boundary.
- **Files:** `src/pages/admin/{guests,tasks,timeline,members,invitation}/{api,queries}.ts`,
  the `*DeleteModal.tsx`, `src/lib/query/useMutation.ts`, sonner.
- **Authz to mirror:** `freeze_member` (migration `20260605000001`),
  `delete_task` (`20260608000010`). Assignee shape: `assignees uuid[]` on
  `event_tasks` + `event_timelines` (see `supabase/schema.sql`).
- Run `npm run build` before done.
