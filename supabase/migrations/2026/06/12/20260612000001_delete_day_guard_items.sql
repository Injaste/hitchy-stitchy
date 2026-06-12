-- Guard day deletion: a day that still has schedule items cannot be deleted.
--
-- Items live in event_timelines, attached to a day through their segment
-- (event_timelines.segment_id -> event_segments.day_id). A day always has a
-- default segment, so we count ITEMS, not segments — an empty day (default
-- segment, no items) stays freely deletable. The permission and
-- keep-at-least-one-day guards are unchanged.

CREATE OR REPLACE FUNCTION public.delete_day(
  p_event_id uuid,
  p_id       uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count integer;
  v_items integer;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to delete days';
  END IF;

  SELECT count(*) INTO v_count FROM event_days WHERE event_id = p_event_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'An event must keep at least one day';
  END IF;

  SELECT count(*) INTO v_items
  FROM event_timelines t
  JOIN event_segments s ON s.id = t.segment_id
  WHERE s.day_id = p_id AND t.event_id = p_event_id;
  IF v_items > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % schedule item(s) before deleting it', v_items;
  END IF;

  DELETE FROM event_days WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;
END;
$$;
