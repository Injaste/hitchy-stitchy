-- HOTFIX (production restore): put the RSVP/guest RPCs back to the OLD model.
-- =============================================================================
-- 3C (20260617000003) repointed these SHARED, production-facing functions onto the
-- new per-page model (event_invitations.invitation_id). The deployed frontend still
-- calls the old signatures / the old model, so live RSVP submit + admin add/edit
-- guest broke. This restores the exact pre-3C bodies (event-keyed, reading old
-- event_invitation). The per-page versions will be re-introduced ADDITIVELY later
-- (new names / parallel path), never by mutating these.
--
-- event_rsvps schema (invitation_id column / FK / unique) is LEFT as-is: it is inert
-- for the old bodies (they insert no invitation_id; NULLs don't collide; the old
-- per-function phone dedup still applies). Only the function bodies are reverted.
-- =============================================================================

-- submit_rsvp: back to p_event_id (drop the p_invitation_id variant first).
DROP FUNCTION IF EXISTS public.submit_rsvp(uuid, jsonb, text);
CREATE OR REPLACE FUNCTION public.submit_rsvp(p_event_id uuid, p_fields jsonb, p_invite_code text DEFAULT NULL)
RETURNS event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_invitation  event_invitation;
  v_rsvp        event_rsvps;
  v_total       integer;
  v_name        text;
  v_phone       text;
  v_guest_count integer;
  v_message     text;
BEGIN
  IF NOT is_event_active(p_event_id) THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  v_name        := trim(p_fields->>'name');
  v_phone       := regexp_replace(trim(p_fields->>'phone'), '\s+', '', 'g');
  v_guest_count := (p_fields->>'guest_count')::integer;
  v_message     := nullif(trim(p_fields->>'message'), '');

  IF v_name IS NULL OR v_name = '' THEN RAISE EXCEPTION 'Name is required'; END IF;
  IF v_phone IS NULL OR v_phone = '' THEN RAISE EXCEPTION 'Phone number is required'; END IF;
  IF v_guest_count IS NULL THEN RAISE EXCEPTION 'Guest count is required'; END IF;

  SELECT * INTO v_invitation FROM event_invitation WHERE event_id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  IF v_invitation.rsvp_deadline IS NOT NULL AND v_invitation.rsvp_deadline < now() THEN
    RAISE EXCEPTION 'RSVP deadline has passed';
  END IF;

  IF EXISTS (SELECT 1 FROM event_rsvps WHERE event_id = p_event_id AND phone = v_phone AND status != 'cancelled') THEN
    RAISE EXCEPTION 'You have already submitted an RSVP. Please contact the event organiser for changes';
  END IF;

  IF v_invitation.rsvp_mode = 'private' THEN
    IF p_invite_code IS NULL THEN RAISE EXCEPTION 'An invite code is required for this event'; END IF;
    IF NOT EXISTS (
      SELECT 1 FROM event_rsvps
      WHERE event_id = p_event_id AND phone = v_phone AND invite_code = p_invite_code AND source = 'private'
    ) THEN
      RAISE EXCEPTION 'Invalid phone number or invite code';
    END IF;
  END IF;

  IF v_guest_count < v_invitation.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_invitation.guest_count_min; END IF;
  IF v_guest_count > v_invitation.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_invitation.guest_count_max; END IF;

  IF v_invitation.max_guests IS NOT NULL THEN
    SELECT COALESCE(SUM(guest_count), 0) INTO v_total FROM event_rsvps WHERE event_id = p_event_id AND status != 'cancelled';
    IF v_total + v_guest_count > v_invitation.max_guests THEN RAISE EXCEPTION 'Sorry, this event has reached maximum capacity'; END IF;
  END IF;

  IF COALESCE((v_invitation.config->'rsvp'->'fields'->'message'->>'visible')::boolean, false) THEN
    IF COALESCE((v_invitation.config->'rsvp'->'fields'->'message'->>'required')::boolean, false) THEN
      IF v_message IS NULL THEN RAISE EXCEPTION 'Message is required'; END IF;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM event_rsvps WHERE event_id = p_event_id AND phone = v_phone AND status = 'cancelled') THEN
    UPDATE event_rsvps SET name = v_name, guest_count = v_guest_count, message = v_message,
      status = 'confirmed', confirmed_at = now(), cancelled_at = NULL
    WHERE event_id = p_event_id AND phone = v_phone RETURNING * INTO v_rsvp;
    RETURN v_rsvp;
  END IF;

  IF v_invitation.rsvp_mode = 'private' THEN
    UPDATE event_rsvps SET name = v_name, guest_count = v_guest_count, message = v_message,
      status = 'confirmed', source = 'public', confirmed_at = now()
    WHERE event_id = p_event_id AND phone = v_phone AND invite_code = p_invite_code RETURNING * INTO v_rsvp;
  ELSE
    INSERT INTO event_rsvps (event_id, name, phone, guest_count, message, source, status, confirmed_at)
    VALUES (p_event_id, v_name, v_phone, v_guest_count, v_message, 'public', 'confirmed', now())
    RETURNING * INTO v_rsvp;
  END IF;

  RETURN v_rsvp;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_rsvp(uuid, jsonb, text) TO anon, authenticated;

-- update_rsvp: back to reading old event_invitation, event-scoped capacity.
CREATE OR REPLACE FUNCTION public.update_rsvp(p_event_id uuid, p_phone text, p_token uuid, p_fields jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_invitation  event_invitation;
  v_rsvp        event_rsvps;
  v_total       integer;
  v_name        text;
  v_guest_count integer;
  v_message     text;
BEGIN
  IF NOT is_event_active(p_event_id) THEN RAISE EXCEPTION 'Event not found'; END IF;

  p_phone := regexp_replace(p_phone, '\s+', '', 'g');

  SELECT * INTO v_rsvp FROM event_rsvps WHERE event_id = p_event_id AND phone = p_phone AND token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'RSVP not found or invalid token'; END IF;
  IF v_rsvp.status = 'cancelled' THEN RAISE EXCEPTION 'Cancelled RSVP cannot be updated'; END IF;

  SELECT * INTO v_invitation FROM event_invitation WHERE event_id = p_event_id;
  IF v_invitation.rsvp_deadline IS NOT NULL AND v_invitation.rsvp_deadline < now() THEN
    RAISE EXCEPTION 'RSVP deadline has passed';
  END IF;

  v_name        := nullif(trim(p_fields->>'name'), '');
  v_guest_count := (p_fields->>'guest_count')::integer;
  v_message     := nullif(trim(p_fields->>'message'), '');

  IF v_guest_count IS NOT NULL THEN
    IF v_guest_count < v_invitation.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_invitation.guest_count_min; END IF;
    IF v_guest_count > v_invitation.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_invitation.guest_count_max; END IF;
    IF v_invitation.max_guests IS NOT NULL THEN
      SELECT COALESCE(SUM(guest_count), 0) INTO v_total FROM event_rsvps
      WHERE event_id = p_event_id AND status != 'cancelled' AND id != v_rsvp.id;
      IF v_total + v_guest_count > v_invitation.max_guests THEN RAISE EXCEPTION 'Sorry, this event has reached maximum capacity'; END IF;
    END IF;
  END IF;

  IF COALESCE((v_invitation.config->'rsvp'->'fields'->'message'->>'visible')::boolean, false) THEN
    IF COALESCE((v_invitation.config->'rsvp'->'fields'->'message'->>'required')::boolean, false) THEN
      IF v_message IS NULL THEN RAISE EXCEPTION 'Message is required'; END IF;
    END IF;
  END IF;

  UPDATE event_rsvps SET name = COALESCE(v_name, name), guest_count = COALESCE(v_guest_count, guest_count), message = v_message
  WHERE id = v_rsvp.id;
END;
$$;

-- create_guests: back to (p_event_id, p_guests), old event_invitation limits.
DROP FUNCTION IF EXISTS public.create_guests(uuid, uuid, jsonb);
CREATE OR REPLACE FUNCTION public.create_guests(p_event_id uuid, p_guests jsonb)
RETURNS SETOF event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller     event_members;
  v_invitation event_invitation;
  v_guest      jsonb;
  v_rsvp       event_rsvps;
  v_phone      text;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'guests', 'create') THEN RAISE EXCEPTION 'Insufficient permission to create guests'; END IF;

  SELECT * INTO v_invitation FROM event_invitation WHERE event_id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  FOR v_guest IN SELECT * FROM jsonb_array_elements(p_guests) LOOP
    IF (v_guest->>'name') IS NULL THEN RAISE EXCEPTION 'Each guest must have a name'; END IF;
    v_phone := NULLIF(btrim(v_guest->>'phone'), '');

    IF COALESCE((v_guest->>'guest_count')::integer, 1) < v_invitation.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_invitation.guest_count_min; END IF;
    IF COALESCE((v_guest->>'guest_count')::integer, 1) > v_invitation.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_invitation.guest_count_max; END IF;

    IF v_phone IS NOT NULL AND EXISTS (SELECT 1 FROM event_rsvps WHERE event_id = p_event_id AND phone = v_phone) THEN
      RAISE EXCEPTION 'Guest with phone % already exists', v_phone;
    END IF;

    INSERT INTO event_rsvps (event_id, name, phone, guest_count, message, source, status, invite_code, confirmed_at, cancelled_at)
    VALUES (
      p_event_id, v_guest->>'name', v_phone, COALESCE((v_guest->>'guest_count')::integer, 1), v_guest->>'message',
      'private', COALESCE((v_guest->>'status')::event_rsvp_status, 'confirmed'),
      upper(substring(md5(random()::text), 1, 6)),
      CASE WHEN COALESCE((v_guest->>'status')::event_rsvp_status, 'confirmed') = 'confirmed' THEN now() ELSE NULL END,
      CASE WHEN (v_guest->>'status')::event_rsvp_status = 'cancelled' THEN now() ELSE NULL END
    )
    RETURNING * INTO v_rsvp;
    RETURN NEXT v_rsvp;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_guests(uuid, jsonb) TO authenticated;

-- update_guest: back to reading old event_invitation, event-scoped dedup.
CREATE OR REPLACE FUNCTION public.update_guest(
  p_event_id uuid, p_id uuid, p_name text DEFAULT NULL, p_phone text DEFAULT NULL,
  p_guest_count integer DEFAULT NULL, p_message text DEFAULT NULL,
  p_status event_rsvp_status DEFAULT NULL, p_invite_code text DEFAULT NULL
)
RETURNS event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller     event_members;
  v_invitation event_invitation;
  v_rsvp       event_rsvps;
  v_phone      text;
BEGIN
  SELECT * INTO v_rsvp FROM event_rsvps WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Guest not found'; END IF;
  IF v_rsvp.event_id != p_event_id THEN RAISE EXCEPTION 'Guest does not belong to this event'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'guests', 'update') THEN RAISE EXCEPTION 'Insufficient permission to update guests'; END IF;

  SELECT * INTO v_invitation FROM event_invitation WHERE event_id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  IF p_guest_count IS NOT NULL THEN
    IF p_guest_count < v_invitation.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_invitation.guest_count_min; END IF;
    IF p_guest_count > v_invitation.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_invitation.guest_count_max; END IF;
  END IF;

  v_phone := NULLIF(btrim(p_phone), '');
  IF v_phone IS NOT NULL AND v_phone IS DISTINCT FROM v_rsvp.phone THEN
    IF EXISTS (SELECT 1 FROM event_rsvps WHERE event_id = p_event_id AND phone = v_phone AND id != p_id) THEN
      RAISE EXCEPTION 'A guest with this phone number already exists';
    END IF;
  END IF;

  UPDATE event_rsvps
  SET name = COALESCE(p_name, name), phone = v_phone, guest_count = COALESCE(p_guest_count, guest_count),
      message = p_message, status = COALESCE(p_status, status), invite_code = COALESCE(p_invite_code, invite_code),
      confirmed_at = CASE WHEN p_status = 'confirmed' THEN now() WHEN p_status IS NOT NULL AND p_status != 'confirmed' THEN NULL ELSE confirmed_at END,
      cancelled_at = CASE WHEN p_status = 'cancelled' THEN now() WHEN p_status IS NOT NULL AND p_status != 'cancelled' THEN NULL ELSE cancelled_at END
  WHERE id = p_id
  RETURNING * INTO v_rsvp;
  RETURN v_rsvp;
END;
$$;
