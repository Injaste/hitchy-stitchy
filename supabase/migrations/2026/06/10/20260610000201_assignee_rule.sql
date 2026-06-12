-- Assignee rule — consistent across tasks + timeline, via shared helpers.
--
-- Rule: a NEWLY-added assignee must be an "assignable member" of the event —
-- active (joined) or pending (invite not expired), and not frozen. Existing
-- assignees can stay or be removed freely even if they've since become
-- frozen/expired; removals are never blocked.
--
-- Two small helpers carry the rule so all four write RPCs stay in sync:
--   * is_assignable_member(event_id, member_id) — the rule predicate (mirrors the
--     FE getAssignableMembers; joins the is_event_member / is_super_admin family).
--   * assert_added_assignees_assignable(event_id, new[], existing[]) — raises if
--     any id in `new` (but not in `existing`) fails the predicate. Pass
--     existing = '{}' on create (all new); the item's current assignees on update.
--
-- Also fixes two prior gaps: tasks rejected pending (no pre-assign) and timeline
-- didn't validate assignees at all (server-boundary gap).

-- is_assignable_member — who may be (newly) assigned to a task/timeline item.
CREATE OR REPLACE FUNCTION public.is_assignable_member(p_event_id uuid, p_member_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM event_members m
    WHERE m.id        = p_member_id
      AND m.event_id  = p_event_id
      AND m.frozen_at IS NULL
      AND (m.joined_at IS NOT NULL OR m.invite_expires_at > now())
  );
$$;

-- assert_added_assignees_assignable — guard only the newly-added assignees.
CREATE OR REPLACE FUNCTION public.assert_added_assignees_assignable(
  p_event_id uuid,
  p_new      uuid[],
  p_existing uuid[]
)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF p_new IS NULL THEN RETURN; END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_new) AS a(id)
    WHERE a.id <> ALL (p_existing)                    -- newly added only
      AND NOT is_assignable_member(p_event_id, a.id)
  ) THEN
    RAISE EXCEPTION 'New assignees must be active or pending members of this event';
  END IF;
END;
$$;

-- update_task — EDIT: assignee guard via assert_added_assignees_assignable.
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
LANGUAGE plpgsql SECURITY DEFINER AS $function$
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

  PERFORM assert_added_assignees_assignable(p_event_id, p_assignees, v_task.assignees);

  v_new_status := COALESCE(p_status, v_task.status);

  UPDATE event_tasks
  SET
    title        = p_title,
    details      = p_details,
    priority     = p_priority,
    due_at       = p_due_at,
    status       = v_new_status,
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

-- create_task — EDIT: assignee guard (existing = '{}', so everything is "added").
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
LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE
  v_caller event_members;
  v_task   event_tasks;
BEGIN
  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  PERFORM assert_added_assignees_assignable(p_event_id, p_assignees, '{}'::uuid[]);

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

-- create_timeline — EDIT: assignee guard (existing = '{}').
CREATE OR REPLACE FUNCTION public.create_timeline(
  p_event_id   uuid,
  p_segment_id uuid,
  p_label      text,
  p_time_start time without time zone,
  p_time_end   time without time zone,
  p_title      text,
  p_details    text,
  p_assignees  uuid[]
)
RETURNS event_timelines
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_item   event_timelines;
  v_day    date;
BEGIN
  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'timeline', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create timeline items';
  END IF;

  IF p_time_end IS NOT NULL AND p_time_end <= p_time_start THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  PERFORM assert_added_assignees_assignable(p_event_id, p_assignees, '{}'::uuid[]);

  SELECT ed.date INTO v_day
  FROM event_segments es
  JOIN event_days ed ON ed.id = es.day_id
  WHERE es.id = p_segment_id AND es.event_id = p_event_id;

  IF v_day IS NULL THEN
    RAISE EXCEPTION 'Segment not found for this event';
  END IF;

  INSERT INTO event_timelines (
    event_id, segment_id, day, label, time_start, time_end, title, details, assignees
  )
  VALUES (
    p_event_id, p_segment_id, v_day, p_label, p_time_start, p_time_end, p_title, p_details, p_assignees
  )
  RETURNING * INTO v_item;

  RETURN v_item;
END;
$$;

-- update_timeline — EDIT: assignee guard via assert_added_assignees_assignable.
CREATE OR REPLACE FUNCTION public.update_timeline(
  p_event_id   uuid,
  p_id         uuid,
  p_segment_id uuid,
  p_label      text,
  p_time_start time without time zone,
  p_time_end   time without time zone,
  p_title      text,
  p_details    text,
  p_assignees  uuid[]
)
RETURNS event_timelines
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller   event_members;
  v_timeline event_timelines;
  v_day      date;
BEGIN
  SELECT * INTO v_timeline FROM event_timelines WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Timeline item not found';
  END IF;

  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'timeline', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update timeline items';
  END IF;

  IF p_time_end IS NOT NULL AND p_time_end <= p_time_start THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  PERFORM assert_added_assignees_assignable(p_event_id, p_assignees, v_timeline.assignees);

  SELECT ed.date INTO v_day
  FROM event_segments es
  JOIN event_days ed ON ed.id = es.day_id
  WHERE es.id = p_segment_id AND es.event_id = p_event_id;

  IF v_day IS NULL THEN
    RAISE EXCEPTION 'Segment not found for this event';
  END IF;

  UPDATE event_timelines
  SET
    segment_id = p_segment_id,
    day        = v_day,
    label      = p_label,
    time_start = p_time_start,
    time_end   = p_time_end,
    title      = p_title,
    details    = p_details,
    assignees  = p_assignees
  WHERE id = p_id
  RETURNING * INTO v_timeline;

  RETURN v_timeline;
END;
$$;

-- Rollback: drop the two helpers, then re-run
-- 20260608000004_timeline_segment_writes.sql (timeline) and
-- 20260608000010_tasks_position_engine.sql (tasks) to restore the prior bodies.
--   DROP FUNCTION IF EXISTS public.assert_added_assignees_assignable(uuid, uuid[], uuid[]);
--   DROP FUNCTION IF EXISTS public.is_assignable_member(uuid, uuid);
