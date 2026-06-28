-- Block RSVP submit + update once the event day has passed.
-- =============================================================================
-- submit_rsvp and update_rsvp already gate on rsvp_deadline. This adds a
-- parallel guard: if the invitation's event_day.date is in the past, both
-- paths raise the same error so the FE can surface it cleanly.
--
-- Both functions are live (public-page danger list), so this is CREATE OR
-- REPLACE — full bodies reproduced from the current live shapes:
--   submit_rsvp   — as left by 20260627000105 (plan_allows → plan_within_limits)
--   update_rsvp   — as left by 20260617000006 (update_rsvp_v2 → update_rsvp via 103)
--   get_public_invitation — as left by 20260628000001 (scheduled publish gates)
-- Only the marked NEW lines differ from those bodies.
-- =============================================================================

-- ── submit_rsvp ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_rsvp(
  p_invitation_id uuid, p_fields jsonb, p_invite_code text DEFAULT NULL
)
RETURNS event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_inv         event_invitations;
  v_rsvp        event_rsvps;
  v_reserved    event_rsvps;
  v_total       integer;
  v_name        text;
  v_phone       text;
  v_guest_count integer;
  v_message     text;
  v_code        text;
  v_event_date  date;   -- NEW
BEGIN
  SELECT * INTO v_inv FROM event_invitations WHERE id = p_invitation_id;
  IF NOT FOUND OR v_inv.published_at IS NULL THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF NOT is_event_active(v_inv.event_id) THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  v_name        := trim(p_fields->>'name');
  v_phone       := regexp_replace(trim(p_fields->>'phone'), '\s+', '', 'g');
  v_guest_count := (p_fields->>'guest_count')::integer;
  v_message     := nullif(trim(p_fields->>'message'), '');
  v_code        := nullif(btrim(p_invite_code), '');

  IF v_name IS NULL OR v_name = '' THEN RAISE EXCEPTION 'Name is required'; END IF;
  IF v_phone IS NULL OR v_phone = '' THEN RAISE EXCEPTION 'Phone number is required'; END IF;
  IF v_guest_count IS NULL THEN RAISE EXCEPTION 'Guest count is required'; END IF;

  IF v_inv.rsvp_deadline IS NOT NULL AND v_inv.rsvp_deadline < now() THEN
    RAISE EXCEPTION 'RSVP deadline has passed'; END IF;

  -- NEW: block once the event day itself is in the past
  SELECT date INTO v_event_date FROM event_days WHERE id = v_inv.day_id;
  IF v_event_date IS NOT NULL AND v_event_date <= current_date THEN
    RAISE EXCEPTION 'RSVP is closed — this event has already taken place'; END IF;

  IF v_guest_count < v_inv.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min; END IF;
  IF v_guest_count > v_inv.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max; END IF;

  IF COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'visible')::boolean, false)
     AND COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'required')::boolean, false)
     AND v_message IS NULL THEN
    RAISE EXCEPTION 'Message is required'; END IF;

  -- PRIVATE: reserved-only.
  IF v_inv.rsvp_mode = 'private' THEN
    SELECT * INTO v_reserved FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND phone = v_phone
    LIMIT 1;

    IF v_code IS NULL OR v_inv.private_code IS NULL OR upper(v_code) <> upper(v_inv.private_code) THEN
      RAISE EXCEPTION 'Invalid invite code'; END IF;
    IF v_reserved.id IS NULL THEN
      RAISE EXCEPTION 'This phone number is not on the guest list'; END IF;

    IF v_inv.max_guests IS NOT NULL THEN
      SELECT COALESCE(SUM(guest_count), 0) INTO v_total FROM event_rsvps
      WHERE invitation_id = p_invitation_id AND status <> 'cancelled' AND id <> v_reserved.id;
      IF v_total + v_guest_count > v_inv.max_guests THEN RAISE EXCEPTION 'Sorry, this event has reached maximum capacity'; END IF;
    END IF;

    UPDATE event_rsvps SET name = v_name, guest_count = v_guest_count, message = v_message,
      status = 'confirmed', confirmed_at = now(), cancelled_at = NULL
    WHERE id = v_reserved.id RETURNING * INTO v_rsvp;
    RETURN v_rsvp;
  END IF;

  -- PUBLIC: open RSVP.
  IF EXISTS (SELECT 1 FROM event_rsvps WHERE invitation_id = p_invitation_id AND phone = v_phone AND status <> 'cancelled') THEN
    RAISE EXCEPTION 'You have already submitted an RSVP. Please contact the event organiser for changes'; END IF;

  IF v_inv.max_guests IS NOT NULL THEN
    SELECT COALESCE(SUM(guest_count), 0) INTO v_total FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND status <> 'cancelled';
    IF v_total + v_guest_count > v_inv.max_guests THEN RAISE EXCEPTION 'Sorry, this event has reached maximum capacity'; END IF;
  END IF;

  IF NOT plan_within_limits(v_inv.event_id, 'guests', v_guest_count) THEN   -- renamed by 20260627000105
    RAISE EXCEPTION 'Sorry, this event has reached maximum capacity'; END IF;

  IF EXISTS (SELECT 1 FROM event_rsvps WHERE invitation_id = p_invitation_id AND phone = v_phone AND status = 'cancelled') THEN
    UPDATE event_rsvps SET name = v_name, guest_count = v_guest_count, message = v_message,
      status = 'confirmed', confirmed_at = now(), cancelled_at = NULL
    WHERE invitation_id = p_invitation_id AND phone = v_phone RETURNING * INTO v_rsvp;
    RETURN v_rsvp;
  END IF;

  INSERT INTO event_rsvps (event_id, invitation_id, name, phone, guest_count, message, status, confirmed_at)
  VALUES (v_inv.event_id, p_invitation_id, v_name, v_phone, v_guest_count, v_message, 'confirmed', now())
  RETURNING * INTO v_rsvp;
  RETURN v_rsvp;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_rsvp(uuid, jsonb, text) TO anon, authenticated;

-- ── update_rsvp ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_rsvp(p_event_id uuid, p_phone text, p_token uuid, p_fields jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_inv event_invitations; v_rsvp event_rsvps; v_total integer;
  v_name text; v_guest_count integer; v_message text;
  v_event_date date;   -- NEW
BEGIN
  IF NOT is_event_active(p_event_id) THEN RAISE EXCEPTION 'Event not found'; END IF;
  p_phone := regexp_replace(p_phone, '\s+', '', 'g');

  SELECT * INTO v_rsvp FROM event_rsvps WHERE event_id = p_event_id AND phone = p_phone AND token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'RSVP not found or invalid token'; END IF;
  IF v_rsvp.status = 'cancelled' THEN RAISE EXCEPTION 'Cancelled RSVP cannot be updated'; END IF;

  SELECT * INTO v_inv FROM event_invitations WHERE id = v_rsvp.invitation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_inv.rsvp_deadline IS NOT NULL AND v_inv.rsvp_deadline < now() THEN RAISE EXCEPTION 'RSVP deadline has passed'; END IF;

  -- NEW: block once the event day itself is in the past
  SELECT date INTO v_event_date FROM event_days WHERE id = v_inv.day_id;
  IF v_event_date IS NOT NULL AND v_event_date <= current_date THEN
    RAISE EXCEPTION 'RSVP is closed — this event has already taken place'; END IF;

  v_name := nullif(trim(p_fields->>'name'), ''); v_guest_count := (p_fields->>'guest_count')::integer; v_message := nullif(trim(p_fields->>'message'), '');

  IF v_guest_count IS NOT NULL THEN
    IF v_guest_count < v_inv.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min; END IF;
    IF v_guest_count > v_inv.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max; END IF;
    IF v_inv.max_guests IS NOT NULL THEN
      SELECT COALESCE(SUM(guest_count), 0) INTO v_total FROM event_rsvps WHERE invitation_id = v_rsvp.invitation_id AND status != 'cancelled' AND id != v_rsvp.id;
      IF v_total + v_guest_count > v_inv.max_guests THEN RAISE EXCEPTION 'Sorry, this event has reached maximum capacity'; END IF;
    END IF;
  END IF;

  IF COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'visible')::boolean, false) THEN
    IF COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'required')::boolean, false) THEN
      IF v_message IS NULL THEN RAISE EXCEPTION 'Message is required'; END IF;
    END IF;
  END IF;

  UPDATE event_rsvps SET name = COALESCE(v_name, name), guest_count = COALESCE(v_guest_count, guest_count), message = v_message WHERE id = v_rsvp.id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_rsvp(uuid, text, uuid, jsonb) TO anon, authenticated;

-- ── get_public_invitation — source event_date from event_days, not published_config ──
-- published_config->>'event_date' is a snapshot that can become stale if the
-- event day's date is updated after publish. event_days.date is authoritative
-- and matches the source the BE (submit_rsvp / update_rsvp) already uses.
CREATE OR REPLACE FUNCTION public.get_public_invitation(p_slug text, p_link_slug text DEFAULT null)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE v_event events; v_inv event_invitations; v_slug text := NULLIF(btrim(lower(p_link_slug)), '');
BEGIN
  SELECT * INTO v_event FROM events WHERE slug = p_slug AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF NOT is_event_active(v_event.id) THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_slug IS NOT NULL THEN
    SELECT * INTO v_inv FROM event_invitations WHERE event_id = v_event.id AND link_slug = v_slug AND published_at <= now();
  ELSE
    SELECT * INTO v_inv FROM event_invitations WHERE event_id = v_event.id AND link_slug IS NULL AND published_at <= now();
    IF NOT FOUND THEN
      SELECT i.* INTO v_inv FROM event_invitations i JOIN event_days d ON d.id = i.day_id
      WHERE i.event_id = v_event.id AND i.published_at <= now() ORDER BY d.date ASC, d.created_at ASC LIMIT 1;
    END IF;
  END IF;
  IF v_inv.id IS NULL THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  RETURN jsonb_build_object(
    'id', v_inv.id, 'event_id', v_inv.event_id,
    'event_date', (SELECT d.date FROM event_days d WHERE d.id = v_inv.day_id),
    'event_time_start', v_inv.published_config->>'event_time_start',
    'event_time_end', null,
    'rsvp_mode', v_inv.rsvp_mode, 'rsvp_deadline', v_inv.rsvp_deadline, 'max_guests', v_inv.max_guests,
    'guest_count_min', v_inv.guest_count_min, 'guest_count_max', v_inv.guest_count_max,
    'confirmation_message', v_inv.confirmation_message, 'config', v_inv.rsvp_config,
    'published_page', jsonb_build_object('id', v_inv.id, 'theme_slug', v_inv.template_key, 'config', v_inv.published_config)
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.get_public_invitation(text, text) TO anon, authenticated;

-- Rollback: revert to the bodies from 20260618000109 / 20260617000006
--   (remove the v_event_date DECLARE and the two IF blocks marked NEW).
-- For get_public_invitation: restore published_config->>'event_date' on line 'event_date'.
