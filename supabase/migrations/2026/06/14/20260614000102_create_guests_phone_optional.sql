-- Migration: create_guests — make phone optional.
-- =============================================================================
-- Admin-added guests may have no phone. Drop the phone-required guard (name is
-- still required), coerce empty string -> NULL so no-phone guests don't collide
-- on UNIQUE(event_id, phone), and only dedupe by phone when one is provided.
-- Body is otherwise unchanged from the live function; signature is
-- (p_event_id uuid, p_guests jsonb) RETURNS SETOF event_rsvps.
-- (The public RSVP path — submit_rsvp — still requires phone; unchanged.)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_guests(p_event_id uuid, p_guests jsonb)
RETURNS SETOF event_rsvps
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller     event_members;
  v_invitation event_invitation;
  v_guest      jsonb;
  v_rsvp       event_rsvps;
  v_phone      text;
BEGIN
  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'guests', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create guests';
  END IF;

  SELECT * INTO v_invitation
  FROM event_invitation
  WHERE event_id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  FOR v_guest IN SELECT * FROM jsonb_array_elements(p_guests)
  LOOP
    -- Name required; phone is now OPTIONAL.
    IF (v_guest->>'name') IS NULL THEN
      RAISE EXCEPTION 'Each guest must have a name';
    END IF;

    -- Empty string -> NULL (keeps the unique constraint happy for no-phone guests).
    v_phone := NULLIF(btrim(v_guest->>'phone'), '');

    IF COALESCE((v_guest->>'guest_count')::integer, 1) < v_invitation.guest_count_min THEN
      RAISE EXCEPTION 'Guest count must be at least %', v_invitation.guest_count_min;
    END IF;

    IF COALESCE((v_guest->>'guest_count')::integer, 1) > v_invitation.guest_count_max THEN
      RAISE EXCEPTION 'Guest count cannot exceed %', v_invitation.guest_count_max;
    END IF;

    -- Only dedupe by phone when one is provided.
    IF v_phone IS NOT NULL AND EXISTS (
      SELECT 1 FROM event_rsvps
      WHERE event_id = p_event_id AND phone = v_phone
    ) THEN
      RAISE EXCEPTION 'Guest with phone % already exists', v_phone;
    END IF;

    INSERT INTO event_rsvps (
      event_id, name, phone, guest_count, message,
      source, status, invite_code, confirmed_at, cancelled_at
    )
    VALUES (
      p_event_id,
      v_guest->>'name',
      v_phone,
      COALESCE((v_guest->>'guest_count')::integer, 1),
      v_guest->>'message',
      'private',
      COALESCE((v_guest->>'status')::event_rsvp_status, 'confirmed'),
      upper(substring(md5(random()::text), 1, 6)),
      CASE WHEN COALESCE((v_guest->>'status')::event_rsvp_status, 'confirmed') = 'confirmed' THEN now() ELSE NULL END,
      CASE WHEN (v_guest->>'status')::event_rsvp_status = 'cancelled' THEN now() ELSE NULL END
    )
    RETURNING * INTO v_rsvp;

    RETURN NEXT v_rsvp;
  END LOOP;
END;
$$;

-- Rollback: restore the live body (re-add the phone IS NULL guard, drop v_phone,
-- insert v_guest->>'phone' directly).
