-- Migration: event_days + event_segments spine — 3/3 RPCs  (Phase 0, Stage 1)
-- =============================================================================
-- Run AFTER 20260608000001_event_days_segments_tables.sql (functions reference
-- the new tables). Idempotent — all CREATE OR REPLACE.
--
-- Seeding is explicit in create_event (no trigger), mirroring how it already
-- seeds access groups / member / invitation / settings. Existing timeline RPCs
-- and the client are untouched (they still use `day`); segment_id is filled for
-- existing rows by the backfill and set directly by the timeline RPCs in Stage 2.
-- =============================================================================


-- =============================================================================
-- create_event — seed days + a default segment per day (explicit, no trigger).
-- Supersedes the 6-arg version from 20260605000004; body identical except for
-- the day/segment seeding block before RETURN.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_event(p_slug text, p_name text, p_date_start date, p_date_end date, p_display_name text, p_role text)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_email     text := auth.jwt() ->> 'email';
  v_event_id  uuid;
  v_slug      text;
  v_admin_id  uuid;
  v_team_id   uuid;
  v_member_id uuid;
  v_day_id    uuid;
  d           date;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  INSERT INTO events (slug, name, date_start, date_end)
  VALUES (p_slug, p_name, p_date_start, p_date_end)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "themes":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"full","members":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

  INSERT INTO event_members (
    event_id, user_id, email, display_name, access_group_id,
    role, is_root, is_bride, is_groom, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, v_email, p_display_name, v_admin_id,
    p_role, true, (p_role = 'Bride'), (p_role = 'Groom'), now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_invitation (event_id) VALUES (v_event_id);
  INSERT INTO event_settings (event_id) VALUES (v_event_id);

  -- Seed one day per calendar date in the range, each with a default segment.
  FOR d IN
    SELECT gs::date
    FROM generate_series(p_date_start, p_date_end, interval '1 day') AS gs
  LOOP
    INSERT INTO event_days (event_id, date)
    VALUES (v_event_id, d)
    RETURNING id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);
  END LOOP;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, p_date_start, p_date_end, false;
END;
$$;


-- =============================================================================
-- Segment CRUD RPCs (ready for the Stage 2 UX). Gated on the `timeline`
-- resource, mirroring the existing access model (has_event_permission). Days are
-- NOT manually managed — they derive from the event date range.
-- =============================================================================

-- create_segment — add a named segment to a day.
CREATE OR REPLACE FUNCTION public.create_segment(
  p_event_id uuid,
  p_day_id   uuid,
  p_name     text
)
RETURNS event_segments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg   event_segments;
  v_order integer;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to add segments';
  END IF;

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'Segment name is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM event_days WHERE id = p_day_id AND event_id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Day not found for this event';
  END IF;

  SELECT COALESCE(max(sort_order), -1) + 1 INTO v_order
  FROM event_segments WHERE day_id = p_day_id;

  INSERT INTO event_segments (event_id, day_id, name, sort_order)
  VALUES (p_event_id, p_day_id, btrim(p_name), v_order)
  RETURNING * INTO v_seg;

  RETURN v_seg;
END;
$$;

-- rename_segment — rename a named segment.
CREATE OR REPLACE FUNCTION public.rename_segment(
  p_event_id uuid,
  p_id       uuid,
  p_name     text
)
RETURNS event_segments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg event_segments;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to rename segments';
  END IF;

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'Segment name is required';
  END IF;

  UPDATE event_segments
  SET name = btrim(p_name)
  WHERE id = p_id AND event_id = p_event_id
  RETURNING * INTO v_seg;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Segment not found';
  END IF;

  RETURN v_seg;
END;
$$;

-- delete_segment — reassign its items to an adjacent segment, then delete.
CREATE OR REPLACE FUNCTION public.delete_segment(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg    event_segments;
  v_target uuid;
  v_count  integer;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to delete segments';
  END IF;

  SELECT * INTO v_seg
  FROM event_segments WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Segment not found';
  END IF;

  SELECT count(*) INTO v_count
  FROM event_segments WHERE day_id = v_seg.day_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'A day must keep at least one segment';
  END IF;

  -- Inherit items: the previous segment by sort_order, else the next.
  SELECT id INTO v_target
  FROM event_segments
  WHERE day_id = v_seg.day_id AND id <> p_id AND sort_order < v_seg.sort_order
  ORDER BY sort_order DESC
  LIMIT 1;

  IF v_target IS NULL THEN
    SELECT id INTO v_target
    FROM event_segments
    WHERE day_id = v_seg.day_id AND id <> p_id
    ORDER BY sort_order ASC
    LIMIT 1;
  END IF;

  UPDATE event_timelines SET segment_id = v_target WHERE segment_id = p_id;

  DELETE FROM event_segments WHERE id = p_id;
END;
$$;

-- reorder_segments — set sort_order from the given id order, within one day.
CREATE OR REPLACE FUNCTION public.reorder_segments(
  p_event_id uuid,
  p_day_id   uuid,
  p_ids      uuid[]
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to reorder segments';
  END IF;

  UPDATE event_segments es
  SET sort_order = pos.ord - 1
  FROM (
    SELECT id, ord
    FROM unnest(p_ids) WITH ORDINALITY AS t(id, ord)
  ) pos
  WHERE es.id = pos.id
    AND es.event_id = p_event_id
    AND es.day_id   = p_day_id;
END;
$$;
