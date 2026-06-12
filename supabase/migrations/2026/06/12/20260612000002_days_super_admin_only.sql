-- Day management is owner-only. The event's dates are its structural spine, so
-- creating / renaming / deleting days is reserved for super admins (the couple).
-- A delegated timeline manager can still edit schedule *items*, but not the days
-- themselves. Swaps the 'timeline' permission checks for is_super_admin_member.
-- Reads are untouched — every member already sees the days via the timeline.

-- create_day: super-admin only (was: timeline 'create').
CREATE OR REPLACE FUNCTION public.create_day(p_event_id uuid, p_date date, p_label text)
RETURNS event_days LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day event_days;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to add days';
  END IF;

  IF p_date IS NULL THEN
    RAISE EXCEPTION 'A date is required';
  END IF;

  IF btrim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'A label is required';
  END IF;

  IF EXISTS (SELECT 1 FROM event_days WHERE event_id = p_event_id AND date = p_date) THEN
    RAISE EXCEPTION 'That day is already on the schedule';
  END IF;

  INSERT INTO event_days (event_id, date, label)
  VALUES (p_event_id, p_date, btrim(p_label))
  RETURNING * INTO v_day;

  INSERT INTO event_segments (event_id, day_id, name, sort_order)
  VALUES (p_event_id, v_day.id, NULL, 0);

  RETURN v_day;
END;
$$;

-- update_day: super-admin only (was: timeline 'update').
CREATE OR REPLACE FUNCTION public.update_day(p_event_id uuid, p_id uuid, p_label text)
RETURNS event_days LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day event_days;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to update days';
  END IF;

  IF btrim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'A label is required';
  END IF;

  UPDATE event_days
  SET label = btrim(p_label)
  WHERE id = p_id AND event_id = p_event_id
  RETURNING * INTO v_day;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;

  RETURN v_day;
END;
$$;

-- delete_day: super-admin only (was: timeline 'delete'); keeps the keep-≥1-day
-- and no-schedule-items guards.
CREATE OR REPLACE FUNCTION public.delete_day(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count integer;
  v_items integer;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
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

-- Rollback: restore the timeline-permission checks (re-run with these predicates)
-- create_day: IF NOT has_event_permission(p_event_id, 'timeline', 'create')
-- update_day: IF NOT has_event_permission(p_event_id, 'timeline', 'update')
-- delete_day: IF NOT has_event_permission(p_event_id, 'timeline', 'delete')
