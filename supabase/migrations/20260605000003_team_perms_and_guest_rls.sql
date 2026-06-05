-- Migration: fix Team perms + gate guest reads
--
-- Team should NOT have access to guests / invitation / themes.
--   - guests  (event_rsvps): member-only PII, not public. Enforce with RLS so
--     "none" is real — a Team member can't pull the list via the API.
--   - invitation / themes: published to the public wedding page (served by the
--     SECURITY DEFINER get_public_invitation, which bypasses RLS). The content
--     isn't secret, so gating those tables buys no security and risks breaking
--     authenticated reads. Team's "none" there is UI-only — no RLS change.
--
-- Corrects the Team seed shipped in 20260605000001 (which had read on those).

-- 1) Team permissions: timeline/tasks (do the work) + members (see roster). Nothing else.
UPDATE public.event_access_groups
SET permissions = '{"timeline":"full","tasks":"full","members":"read"}'::jsonb
WHERE name = 'Team';

-- 2) Fix create_event so future events seed Team correctly.
CREATE OR REPLACE FUNCTION public.create_event(p_slug text, p_name text, p_date_start date, p_date_end date, p_display_name text)
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
    is_root, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, v_email, p_display_name, v_admin_id,
    true, now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_invitation (event_id) VALUES (v_event_id);
  INSERT INTO event_settings (event_id) VALUES (v_event_id);

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, p_date_start, p_date_end, false;
END;
$$;

-- 3) Gate guest-list reads. Public RSVP flows use SECURITY DEFINER RPCs and are
--    unaffected; this only restricts authenticated members to guests:read+.
DROP POLICY IF EXISTS event_rsvps_select ON public.event_rsvps;
CREATE POLICY event_rsvps_select ON public.event_rsvps
  FOR SELECT TO authenticated
  USING (is_event_member(event_id) AND has_event_permission(event_id, 'guests', 'read'));
