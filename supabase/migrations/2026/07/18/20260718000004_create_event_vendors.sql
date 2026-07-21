-- Migration: create_event — seed vendors:full into the Admin group
-- =============================================================================
-- Vendors becomes a DELEGATED resource: an Admin-group member manages it fully,
-- Team gets nothing. That's unlike budget/gifts (couple-only, granted to nobody)
-- — so vendors IS keyed into the Admin permissions JSON, exactly like guests /
-- invitation. Super-admins pass via bypass regardless.
--
-- Re-pastes the current body (20260618000105) verbatim; the ONLY change is the
-- new "vendors":"full" key in the Admin group's permissions. Team is untouched.
-- (Existing events are backfilled in 20260718000008.)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_event(
  p_slug         text,
  p_name         text,
  p_days         jsonb,
  p_display_name text,
  p_role         text
)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_event_id  uuid;
  v_slug      text;
  v_admin_id  uuid;
  v_team_id   uuid;
  v_member_id uuid;
  v_day_id    uuid;
  v_start     date;
  v_end       date;
  v_free_available boolean;   -- account's free ($0) event still available? (else pending pay)
  rec         record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  IF p_days IS NULL OR jsonb_array_length(p_days) = 0 THEN
    RAISE EXCEPTION 'Select at least one event day';
  END IF;

  IF is_slug_taken(p_slug) THEN
    RAISE EXCEPTION 'This URL is already taken' USING ERRCODE = 'unique_violation';
  END IF;

  SELECT min((d->>'date')::date), max((d->>'date')::date)
  INTO v_start, v_end
  FROM jsonb_array_elements(p_days) AS d;

  v_free_available := free_event_available(v_user_id);

  INSERT INTO events (slug, name, activated_at)
  VALUES (p_slug, p_name, CASE WHEN v_free_available THEN now() ELSE NULL END)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  -- No budget/gifts grant — those are super-admin only (the couple), enforced by
  -- the RPCs/RLS; they stay in the catalog for discovery. Vendors, by contrast,
  -- is a DELEGATED resource: Admin manages it fully, Team gets none.
  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"read","members":"read","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

  INSERT INTO event_members (
    event_id, user_id, display_name, access_group_id,
    role, is_root, is_bride, is_groom, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, p_display_name, v_admin_id,
    p_role, true, (p_role = 'Bride'), (p_role = 'Groom'), now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_settings (event_id) VALUES (v_event_id);
  -- (no event_budget seed — buckets are lazy, per day)

  FOR rec IN
    SELECT DISTINCT ON (dt) dt AS date, lbl AS label
    FROM (
      SELECT (d->>'date')::date              AS dt,
             btrim(COALESCE(d->>'label', '')) AS lbl
      FROM jsonb_array_elements(p_days) AS d
    ) s
    ORDER BY dt
  LOOP
    IF rec.label = '' THEN
      RAISE EXCEPTION 'Each event day needs a label';
    END IF;

    INSERT INTO event_days (event_id, date, label)
    VALUES (v_event_id, rec.date, rec.label)
    RETURNING event_days.id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);
  END LOOP;

  DELETE FROM slug_reservations WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, v_start, v_end, NOT v_free_available;
END;
$$;

-- Rollback: re-paste create_event (20260618000105) WITHOUT "vendors":"full" in
-- the Admin group.
