-- submit_rsvp / update_rsvp — honor the deadline's time-of-day.
-- rsvp_deadline is timestamptz, but the guard compared it against CURRENT_DATE
-- (a date → midnight), so the picked time was dropped and RSVPs stayed open
-- until midnight after the deadline day. Compare against now() instead so the
-- cutoff fires at the exact instant set (matches the admin countdown banner).
-- Only the comparison changed; both bodies are otherwise the live definitions.

CREATE OR REPLACE FUNCTION public.submit_rsvp(p_event_id uuid, p_fields jsonb, p_invite_code text DEFAULT NULL::text)
 RETURNS event_rsvps
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_invitation  event_invitation;
  v_rsvp        event_rsvps;
  v_total       integer;
  v_name        text;
  v_phone       text;
  v_guest_count integer;
  v_message     text;
BEGIN
  IF NOT is_event_active(p_event_id) THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  v_name        := trim(p_fields->>'name');
  v_phone       := regexp_replace(trim(p_fields->>'phone'), '\s+', '', 'g');
  v_guest_count := (p_fields->>'guest_count')::integer;
  v_message     := nullif(trim(p_fields->>'message'), '');

  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Name is required';
  END IF;

  IF v_phone IS NULL OR v_phone = '' THEN
    RAISE EXCEPTION 'Phone number is required';
  END IF;

  IF v_guest_count IS NULL THEN
    RAISE EXCEPTION 'Guest count is required';
  END IF;

  SELECT * INTO v_invitation
  FROM event_invitation
  WHERE event_id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF v_invitation.rsvp_deadline IS NOT NULL AND v_invitation.rsvp_deadline < now() THEN
    RAISE EXCEPTION 'RSVP deadline has passed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM event_rsvps
    WHERE event_id = p_event_id
      AND phone    = v_phone
      AND status  != 'cancelled'
  ) THEN
    RAISE EXCEPTION 'You have already submitted an RSVP. Please contact the event organiser for changes';
  END IF;

  IF v_invitation.rsvp_mode = 'private' THEN
    IF p_invite_code IS NULL THEN
      RAISE EXCEPTION 'An invite code is required for this event';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM event_rsvps
      WHERE event_id    = p_event_id
        AND phone       = v_phone
        AND invite_code = p_invite_code
        AND source      = 'private'
    ) THEN
      RAISE EXCEPTION 'Invalid phone number or invite code';
    END IF;
  END IF;

  IF v_guest_count < v_invitation.guest_count_min THEN
    RAISE EXCEPTION 'Guest count must be at least %', v_invitation.guest_count_min;
  END IF;

  IF v_guest_count > v_invitation.guest_count_max THEN
    RAISE EXCEPTION 'Guest count cannot exceed %', v_invitation.guest_count_max;
  END IF;

  IF v_invitation.max_guests IS NOT NULL THEN
    SELECT COALESCE(SUM(guest_count), 0) INTO v_total
    FROM event_rsvps
    WHERE event_id = p_event_id
      AND status  != 'cancelled';

    IF v_total + v_guest_count > v_invitation.max_guests THEN
      RAISE EXCEPTION 'Sorry, this event has reached maximum capacity';
    END IF;
  END IF;

  IF COALESCE((v_invitation.config->'rsvp'->'fields'->'message'->>'visible')::boolean, false) THEN
    IF COALESCE((v_invitation.config->'rsvp'->'fields'->'message'->>'required')::boolean, false) THEN
      IF v_message IS NULL THEN
        RAISE EXCEPTION 'Message is required';
      END IF;
    END IF;
  END IF;

  -- reactivate cancelled RSVP
  IF EXISTS (
    SELECT 1 FROM event_rsvps
    WHERE event_id = p_event_id
      AND phone    = v_phone
      AND status   = 'cancelled'
  ) THEN
    UPDATE event_rsvps
    SET
      name         = v_name,
      guest_count  = v_guest_count,
      message      = v_message,
      status       = 'confirmed',
      confirmed_at = now(),
      cancelled_at = NULL
    WHERE event_id = p_event_id
      AND phone    = v_phone
    RETURNING * INTO v_rsvp;

    RETURN v_rsvp;
  END IF;

  IF v_invitation.rsvp_mode = 'private' THEN
    UPDATE event_rsvps
    SET
      name         = v_name,
      guest_count  = v_guest_count,
      message      = v_message,
      status       = 'confirmed',
      source       = 'public',
      confirmed_at = now()
    WHERE event_id    = p_event_id
      AND phone       = v_phone
      AND invite_code = p_invite_code
    RETURNING * INTO v_rsvp;
  ELSE
    INSERT INTO event_rsvps (
      event_id, name, phone, guest_count, message, source, status, confirmed_at
    )
    VALUES (
      p_event_id, v_name, v_phone, v_guest_count, v_message, 'public', 'confirmed', now()
    )
    RETURNING * INTO v_rsvp;
  END IF;

  RETURN v_rsvp;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_rsvp(p_event_id uuid, p_phone text, p_token uuid, p_fields jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_invitation  event_invitation;
  v_rsvp        event_rsvps;
  v_total       integer;
  v_name        text;
  v_guest_count integer;
  v_message     text;
BEGIN
  IF NOT is_event_active(p_event_id) THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  p_phone := regexp_replace(p_phone, '\s+', '', 'g');

  SELECT * INTO v_rsvp
  FROM event_rsvps
  WHERE event_id = p_event_id
    AND phone    = p_phone
    AND token    = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'RSVP not found or invalid token';
  END IF;

  IF v_rsvp.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled RSVP cannot be updated';
  END IF;

  SELECT * INTO v_invitation
  FROM event_invitation
  WHERE event_id = p_event_id;

  IF v_invitation.rsvp_deadline IS NOT NULL AND v_invitation.rsvp_deadline < now() THEN
    RAISE EXCEPTION 'RSVP deadline has passed';
  END IF;

  v_name        := nullif(trim(p_fields->>'name'), '');
  v_guest_count := (p_fields->>'guest_count')::integer;
  v_message     := nullif(trim(p_fields->>'message'), '');

  IF v_guest_count IS NOT NULL THEN
    IF v_guest_count < v_invitation.guest_count_min THEN
      RAISE EXCEPTION 'Guest count must be at least %', v_invitation.guest_count_min;
    END IF;

    IF v_guest_count > v_invitation.guest_count_max THEN
      RAISE EXCEPTION 'Guest count cannot exceed %', v_invitation.guest_count_max;
    END IF;

    IF v_invitation.max_guests IS NOT NULL THEN
      SELECT COALESCE(SUM(guest_count), 0) INTO v_total
      FROM event_rsvps
      WHERE event_id = p_event_id
        AND status   != 'cancelled'
        AND id       != v_rsvp.id;

      IF v_total + v_guest_count > v_invitation.max_guests THEN
        RAISE EXCEPTION 'Sorry, this event has reached maximum capacity';
      END IF;
    END IF;
  END IF;

  IF COALESCE((v_invitation.config->'rsvp'->'fields'->'message'->>'visible')::boolean, false) THEN
    IF COALESCE((v_invitation.config->'rsvp'->'fields'->'message'->>'required')::boolean, false) THEN
      IF v_message IS NULL THEN
        RAISE EXCEPTION 'Message is required';
      END IF;
    END IF;
  END IF;

  UPDATE event_rsvps
  SET
    name        = COALESCE(v_name, name),
    guest_count = COALESCE(v_guest_count, guest_count),
    message     = v_message
  WHERE id = v_rsvp.id;
END;
$function$;

-- Rollback: re-run both CREATE OR REPLACE bodies above with the comparison
-- reverted from `< now()` back to `< CURRENT_DATE` in each.
