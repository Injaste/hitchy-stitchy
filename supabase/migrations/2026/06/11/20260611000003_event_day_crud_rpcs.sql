-- Migration: day CRUD — create / update / delete days after creation.
-- =============================================================================
-- create_event seeds the days picked in the wizard; these let an admin add a
-- forgotten day (e.g. Walimah), relabel one, or remove one — without recreating
-- the event. Named to match the segment RPCs (create_/update_/delete_, noun
-- stripped of the event_ prefix). Gated on the `timeline` resource (days are the
-- timeline spine, same gate as segments). create seeds a default segment like
-- create_event; delete cascades the day's segments + items via FK and is blocked
-- on the last remaining day. The date span is derived from event_days on read
-- (events_with_dates view, migration …000005) — nothing here writes it back.
-- =============================================================================

-- create_day — append a labeled day + its default segment; expand envelope.
CREATE OR REPLACE FUNCTION public.create_day(
  p_event_id uuid,
  p_date     date,
  p_label    text
)
RETURNS event_days
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day event_days;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to add days';
  END IF;

  IF p_date IS NULL THEN
    RAISE EXCEPTION 'A date is required';
  END IF;

  IF btrim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'A label is required';
  END IF;

  IF EXISTS (
    SELECT 1 FROM event_days WHERE event_id = p_event_id AND date = p_date
  ) THEN
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

-- update_day — rename a day. Label is required (NOT NULL), so a blank is rejected.
CREATE OR REPLACE FUNCTION public.update_day(
  p_event_id uuid,
  p_id       uuid,
  p_label    text
)
RETURNS event_days
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day event_days;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'update') THEN
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

-- delete_day — remove a day (cascades its segments + items). Blocked when it's
-- the last day.
CREATE OR REPLACE FUNCTION public.delete_day(
  p_event_id uuid,
  p_id       uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to delete days';
  END IF;

  SELECT count(*) INTO v_count FROM event_days WHERE event_id = p_event_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'An event must keep at least one day';
  END IF;

  DELETE FROM event_days WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;
END;
$$;

-- Rollback:
-- DROP FUNCTION IF EXISTS public.delete_day(uuid, uuid);
-- DROP FUNCTION IF EXISTS public.update_day(uuid, uuid, text);
-- DROP FUNCTION IF EXISTS public.create_day(uuid, date, text);
