-- Migration: event dates from days — make event_days the single source of truth
-- =============================================================================
-- for an event's date span, and DROP events.date_start / date_end.
--
-- This is the FINAL, infrastructure-impacting step of the multi-day feature; the
-- additive parts run first in …000001 (label), …000002 (slug_reservations),
-- …000003 (day CRUD), …000004 (cron).
--
-- WHY: the stored date columns were a denormalised envelope hand-synced from
-- event_days — a drift risk and implicit table coupling. We remove the stored
-- copy and DERIVE the span from event_days on read. Nothing writes the span
-- back, so there is nothing to drift. (The day CRUD RPCs in …000003 already
-- carry no sync, so this migration leaves them untouched.)
--
-- LINCHPIN INVARIANT: every event always has ≥1 event_day (create_event requires
-- ≥1; delete_day keeps ≥1), so min(date)/max(date) is never null and the derived
-- span is always present — the client keeps treating date_start/date_end as set.
--
-- BREAKING: create_event's signature changes (date range → jsonb day set). The
-- client ships with it. Ordering below is deliberate: every reader/writer stops
-- touching the columns, the read-only view is added, the dead event_slugs view is
-- dropped, and only THEN are the columns dropped.
-- =============================================================================


-- 1) create_event — labeled day set; derives the span for its RETURN only and no
--    longer stores it. (No email: event_members.email was dropped in …000101.)
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_event(text, text, date, date, text, text);

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
  rec         record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  IF p_days IS NULL OR jsonb_array_length(p_days) = 0 THEN
    RAISE EXCEPTION 'Select at least one event day';
  END IF;

  -- Defense-in-depth: the wizard reserves the slug, but a direct RPC call would
  -- skip that. Re-check (caller's own reservation excluded). Raise as a
  -- unique_violation so the client maps it to the same "already taken" message.
  IF is_slug_taken(p_slug) THEN
    RAISE EXCEPTION 'This URL is already taken' USING ERRCODE = 'unique_violation';
  END IF;

  -- Span derived from the picked days — for the return value only; not stored.
  SELECT min((d->>'date')::date), max((d->>'date')::date)
  INTO v_start, v_end
  FROM jsonb_array_elements(p_days) AS d;

  INSERT INTO events (slug, name)
  VALUES (p_slug, p_name)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "themes":"full","members":"full","access":"read","budget":"full"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"full","members":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

  -- The creator is a fully-joined root member; no email stored.
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

  INSERT INTO event_invitation (event_id) VALUES (v_event_id);
  INSERT INTO event_settings (event_id) VALUES (v_event_id);
  INSERT INTO event_budget (event_id) VALUES (v_event_id);

  -- One labeled day per distinct date (last label wins on a dupe), each with a
  -- default segment — mirrors create_day. Labels are required (NOT NULL).
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

  -- The slug is now owned by the event; drop the caller's reservation.
  DELETE FROM slug_reservations WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, v_start, v_end, false;
END;
$$;


-- 2) events_with_dates — read-only projection: each event + its derived span.
--    The single place min/max lives. Explicit column list (not e.*) so it does
--    not depend on the columns we are about to drop. LEFT JOIN so an event is
--    never lost (the ≥1-day invariant means the span is never actually null).
--    SECURITY DEFINER (security_invoker = false, set explicitly per policy): it
--    runs as owner and bypasses RLS, so it is INTERNAL ONLY — the two readers
--    below (both SECURITY DEFINER) use it; the client never queries it directly.
--    Access is revoked from client roles so the definer view can't leak rows.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.events_with_dates
WITH (security_invoker = false) AS
SELECT e.id, e.slug, e.name, e.deleted_at,
       d.date_start, d.date_end
FROM public.events e
LEFT JOIN (
  SELECT event_id, min(date) AS date_start, max(date) AS date_end
  FROM public.event_days
  GROUP BY event_id
) d ON d.event_id = e.id;

REVOKE ALL ON public.events_with_dates FROM anon, authenticated;


-- 3) get_user_events / get_bootstrap_context — read the span from the view.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_events()
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT e.id, e.slug, e.name, e.date_start, e.date_end
  FROM event_members em
  JOIN events_with_dates e ON e.id = em.event_id
  WHERE em.user_id   = auth.uid()
    AND em.joined_at IS NOT NULL
    AND em.frozen_at IS NULL
    AND e.deleted_at IS NULL
  ORDER BY e.date_start DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_bootstrap_context(p_slug text)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_event        events;
  v_member       event_members;
  v_access_group event_access_groups;
  v_start        date;
  v_end          date;
BEGIN
  SELECT * INTO v_event
  FROM events WHERE slug = p_slug AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_member
  FROM event_members
  WHERE event_id = v_event.id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF v_member.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_SUSPENDED: Your access to this event has been suspended';
  END IF;

  IF v_member.joined_at IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_access_group
  FROM event_access_groups WHERE id = v_member.access_group_id;

  -- Span derived from event_days (single source of truth).
  SELECT date_start, date_end INTO v_start, v_end
  FROM events_with_dates WHERE id = v_event.id;

  RETURN json_build_object(
    'event_id',   v_event.id,
    'slug',       v_event.slug,
    'event_name', v_event.name,
    'date_start', v_start,
    'date_end',   v_end,
    'member', json_build_object(
      'id',           v_member.id,
      'display_name', v_member.display_name,
      'role',         v_member.role,
      'is_root',      v_member.is_root,
      'is_bride',     v_member.is_bride,
      'is_groom',     v_member.is_groom
    ),
    'access_group', json_build_object(
      'id',          v_access_group.id,
      'name',        v_access_group.name,
      'permissions', v_access_group.permissions
    )
  );
END;
$$;


-- 4) Drop the now-dead event_slugs view (superseded by is_slug_taken, and it
--    references the columns we are about to drop).
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.event_slugs;


-- 5) Drop the stored span — event_days is now the only source of truth.
--    IF EXISTS so a re-run is a clean no-op.
-- -----------------------------------------------------------------------------
ALTER TABLE public.events
  DROP COLUMN IF EXISTS date_start,
  DROP COLUMN IF EXISTS date_end;


-- Rollback (best-effort): re-add the columns, backfill from event_days, restore
-- the event_slugs view, and re-run create_event / get_user_events /
-- get_bootstrap_context from …000101 (the range-based versions), then:
--   ALTER TABLE public.events ADD COLUMN date_start date, ADD COLUMN date_end date;
--   UPDATE public.events e SET date_start = s.mn, date_end = s.mx
--     FROM (SELECT event_id, min(date) mn, max(date) mx FROM public.event_days GROUP BY event_id) s
--     WHERE s.event_id = e.id;
--   ALTER TABLE public.events ALTER COLUMN date_start SET NOT NULL, ALTER COLUMN date_end SET NOT NULL;
--   DROP VIEW IF EXISTS public.events_with_dates;
