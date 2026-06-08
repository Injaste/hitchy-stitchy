-- Migration: tasks ordering engine — per-row fractional `position`
-- =============================================================================
-- Replaces the single event_settings.task_order jsonb blob with a per-row
-- `position double precision` on event_tasks (Trello-style fractional ranking).
-- A reorder becomes a one-row O(1) write and dissolves the checkbox-vs-drag
-- ordering divergence (update_task never touched task_order).
--
-- Display order within a column = ORDER BY status, position ASC.
-- A drag sets the moved row's position to the midpoint of its neighbours;
-- a status change with no explicit position appends to the column bottom.
--
-- Permission model (per product decision):
--   * move_task (drag / reorder) is gated on tasks:update ONLY — no creator/
--     assignee carve-out. Dragging is an update-level action.
--   * update_task / delete_task / archive_tasks keep "update OR creator OR
--     assignee/creator" so a member can edit / complete / delete / archive
--     their OWN task without update. The checkbox routes through update_task,
--     which now appends a fresh position when the status changes (so a
--     completed card lands at the column bottom instead of colliding).
--   * create_task stays active-member-only by design (any member may create).
--
-- create_task / update_task / delete_task / archive_tasks below are the LIVE
-- bodies (verified against pg_get_functiondef); the only changes are the
-- position handling, the move_task gate, and update_task's completed_at fix
-- (no longer re-stamps an already-done task). event_settings.task_order is
-- left in place but DORMANT (nothing writes it) for a later drop.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) position column + backfill from the existing task_order arrays
-- -----------------------------------------------------------------------------
ALTER TABLE event_tasks ADD COLUMN position double precision;

-- Within each (event, status): tasks present in task_order keep that order
-- (by array index), tasks absent from it are appended by created_at. Spaced by
-- 1000 to leave room for future midpoint inserts.
WITH ranked AS (
  SELECT
    t.id,
    row_number() OVER (
      PARTITION BY t.event_id, t.status
      ORDER BY COALESCE(arr.ord, 1000000000), t.created_at, t.id
    ) AS rn
  FROM event_tasks t
  LEFT JOIN event_settings s ON s.event_id = t.event_id
  LEFT JOIN LATERAL (
    SELECT elem.ord
    FROM jsonb_array_elements_text(
           COALESCE(s.task_order -> t.status::text, '[]'::jsonb)
         ) WITH ORDINALITY AS elem(id, ord)
    WHERE elem.id = t.id::text
    LIMIT 1
  ) arr ON true
)
UPDATE event_tasks t
SET position = ranked.rn * 1000
FROM ranked
WHERE ranked.id = t.id;

ALTER TABLE event_tasks ALTER COLUMN position SET NOT NULL;

-- -----------------------------------------------------------------------------
-- 2) move_task — drag / reorder. Gated tasks:update ONLY.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.move_task(
  p_event_id uuid,
  p_id       uuid,
  p_status   event_task_status,
  p_position double precision DEFAULT NULL
)
RETURNS event_tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_caller   event_members;
  v_task     event_tasks;
  v_position double precision;
BEGIN
  SELECT * INTO v_task FROM event_tasks WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  -- reorder is an update-level action: no creator/assignee carve-out
  IF NOT has_event_permission(p_event_id, 'tasks', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to reorder tasks';
  END IF;

  -- explicit position (drag midpoint), else append to the bottom of the column
  v_position := COALESCE(
    p_position,
    (SELECT COALESCE(max(position), 0) + 1000
       FROM event_tasks
      WHERE event_id = p_event_id
        AND status = p_status
        AND archived_at IS NULL
        AND id <> p_id)
  );

  UPDATE event_tasks
  SET status       = p_status,
      position     = v_position,
      -- to done: keep the original completion time on a same-column reorder,
      -- stamp now() on first completion; out of done: clear.
      completed_at = CASE WHEN p_status = 'done' THEN COALESCE(completed_at, now()) END
  WHERE id = p_id
  RETURNING * INTO v_task;

  RETURN v_task;
END;
$function$;

-- -----------------------------------------------------------------------------
-- 3) update_task — edit fields + checkbox status. Keeps the creator/assignee
--    carve-out. Changes vs live: (a) append a fresh position when the status
--    changes, so a completed card lands at the new column's bottom; (b)
--    completed_at only stamps on the transition INTO done (COALESCE keeps the
--    original time), so editing an already-done task no longer resets it.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_task(
  p_event_id  uuid,
  p_id        uuid,
  p_title     text,
  p_details   text DEFAULT NULL,
  p_priority  event_task_priority DEFAULT NULL,
  p_due_at    date DEFAULT NULL,
  p_status    event_task_status DEFAULT NULL,
  p_assignees uuid[] DEFAULT NULL,
  p_label     text DEFAULT NULL
)
RETURNS event_tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_caller     event_members;
  v_task       event_tasks;
  v_new_status event_task_status;
BEGIN
  SELECT * INTO v_task FROM event_tasks WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'tasks', 'update') THEN
    IF v_task.created_by IS DISTINCT FROM v_caller.id AND
       NOT (v_caller.id = ANY(v_task.assignees)) THEN
      RAISE EXCEPTION 'Insufficient permission to update this task';
    END IF;
  END IF;

  IF p_assignees IS NOT NULL AND array_length(p_assignees, 1) > 0 THEN
    IF (
      SELECT COUNT(*) FROM event_members
      WHERE id        = ANY(p_assignees)
        AND event_id  = p_event_id
        AND joined_at IS NOT NULL
        AND frozen_at IS NULL
    ) != array_length(p_assignees, 1) THEN
      RAISE EXCEPTION 'One or more assignees are not active members of this event';
    END IF;
  END IF;

  v_new_status := COALESCE(p_status, v_task.status);

  UPDATE event_tasks
  SET
    title        = p_title,
    details      = p_details,
    priority     = p_priority,
    due_at       = p_due_at,
    status       = v_new_status,
    -- only a status change repositions (checkbox); field-only edits keep slot
    position     = CASE
      WHEN v_new_status IS DISTINCT FROM v_task.status THEN
        (SELECT COALESCE(max(position), 0) + 1000
           FROM event_tasks
          WHERE event_id = p_event_id
            AND status = v_new_status
            AND archived_at IS NULL
            AND id <> p_id)
      ELSE position
    END,
    -- stamp only on the transition INTO done; preserve the original time
    -- when an already-done task is edited; clear when leaving done
    completed_at = CASE
      WHEN v_new_status = 'done' THEN COALESCE(completed_at, now())
      ELSE NULL
    END,
    assignees    = COALESCE(p_assignees, assignees),
    label        = p_label
  WHERE id = p_id
  RETURNING * INTO v_task;

  RETURN v_task;
END;
$function$;

-- -----------------------------------------------------------------------------
-- 4) create_task — assign position (append), drop the task_order maintenance
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_task(
  p_event_id  uuid,
  p_title     text,
  p_details   text DEFAULT NULL,
  p_priority  event_task_priority DEFAULT NULL,
  p_due_at    date DEFAULT NULL,
  p_assignees uuid[] DEFAULT NULL,
  p_label     text DEFAULT NULL,
  p_status    event_task_status DEFAULT 'todo'
)
RETURNS event_tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_caller event_members;
  v_task   event_tasks;
BEGIN
  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF p_assignees IS NOT NULL AND array_length(p_assignees, 1) > 0 THEN
    IF (
      SELECT COUNT(*) FROM event_members
      WHERE id        = ANY(p_assignees)
        AND event_id  = p_event_id
        AND joined_at IS NOT NULL
        AND frozen_at IS NULL
    ) != array_length(p_assignees, 1) THEN
      RAISE EXCEPTION 'One or more assignees are not active members of this event';
    END IF;
  END IF;

  INSERT INTO event_tasks (
    event_id, title, details, priority, due_at,
    assignees, created_by, label, status, completed_at, position
  )
  VALUES (
    p_event_id, p_title, p_details, p_priority, p_due_at,
    COALESCE(p_assignees, '{}'), v_caller.id, p_label, p_status,
    CASE WHEN p_status = 'done' THEN now() ELSE NULL END,
    (SELECT COALESCE(max(position), 0) + 1000
       FROM event_tasks
      WHERE event_id = p_event_id
        AND status = p_status
        AND archived_at IS NULL)
  )
  RETURNING * INTO v_task;

  RETURN v_task;
END;
$function$;

-- -----------------------------------------------------------------------------
-- 5) delete_task — just delete (drop the task_order removal)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_task(p_event_id uuid, p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_caller event_members;
  v_task   event_tasks;
BEGIN
  SELECT * INTO v_task FROM event_tasks WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'tasks', 'delete') THEN
    IF v_task.created_by IS DISTINCT FROM v_caller.id THEN
      RAISE EXCEPTION 'Insufficient permission to delete this task';
    END IF;
  END IF;

  DELETE FROM event_tasks WHERE id = p_id;
END;
$function$;

-- -----------------------------------------------------------------------------
-- 6) archive_tasks — flip archived_at; on restore, append to the column bottom.
--    Live body with the task_order maintenance replaced by position handling.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.archive_tasks(p_event_id uuid, p_ids uuid[], p_archive boolean)
RETURNS SETOF event_tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_caller event_members;
  v_task   event_tasks;
BEGIN
  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  FOR v_task IN
    SELECT * FROM event_tasks
    WHERE id = ANY(p_ids)
      AND event_id = p_event_id
  LOOP
    IF NOT has_event_permission(p_event_id, 'tasks', 'update') THEN
      IF v_task.created_by IS DISTINCT FROM v_caller.id THEN
        RAISE EXCEPTION 'Insufficient permission to archive task "%"', v_task.title;
      END IF;
    END IF;

    UPDATE event_tasks
    SET archived_at = CASE WHEN p_archive THEN now() ELSE NULL END,
        -- on restore, drop to the bottom of the live column; on archive, keep
        position = CASE
          WHEN p_archive THEN position
          ELSE (SELECT COALESCE(max(position), 0) + 1000
                  FROM event_tasks
                 WHERE event_id = p_event_id
                   AND status = v_task.status
                   AND archived_at IS NULL
                   AND id <> v_task.id)
        END
    WHERE id = v_task.id
    RETURNING * INTO v_task;

    RETURN NEXT v_task;
  END LOOP;
END;
$function$;

-- -----------------------------------------------------------------------------
-- 7) retire update_task_order (task_order column kept dormant for now)
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.update_task_order(uuid, jsonb);

COMMIT;
