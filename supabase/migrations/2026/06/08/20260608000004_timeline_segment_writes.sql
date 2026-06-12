-- Migration: timeline writes — ADD segment-based create/update  (Phase 0, Stage 2)
-- =============================================================================
-- ADDITIVE — adds segment-based OVERLOADS of create_timeline / update_timeline
-- ALONGSIDE the existing day-based versions (which are NOT dropped here).
-- PostgREST routes by the args sent:
--   • live client sends p_day        → old (day-based) function
--   • new Stage 2 client sends p_segment_id → new (segment-based) function
-- Both write `day` (the new one derives it from the segment), so
-- event_timelines.day stays consistent either way.
--
-- ✅ SAFE TO RUN ON PROD NOW (same class as 001–003): the live client is
-- untouched, and the new client can be tested against production immediately
-- (run it locally against prod). The old overloads are removed later by 006
-- (timeline_drop_day_rpcs), once the new client is fully live.
--
-- start_timeline / end_timeline / delete_timeline are unchanged (no `day`).
--
-- NOTE: after running, PostgREST normally reloads its schema automatically; if
-- the new overload isn't found immediately, run:  NOTIFY pgrst, 'reload schema';
-- =============================================================================


-- Heal any items the old client created since the backfill (NULL segment_id) so
-- the new UI sees a clean baseline. Idempotent. A segment_id-only update doesn't
-- change started_at, so the on-timeline-start push function bails → no pushes.
UPDATE public.event_timelines t
SET segment_id = es.id
FROM public.event_days ed
JOIN public.event_segments es ON es.day_id = ed.id AND es.name IS NULL
WHERE ed.event_id = t.event_id
  AND ed.date     = t.day
  AND t.segment_id IS NULL;


-- =============================================================================
-- create_timeline (segment-based overload) — derives `day` from the segment.
-- =============================================================================
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


-- =============================================================================
-- update_timeline (segment-based overload) — derives `day` from the segment.
-- =============================================================================
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
