-- Migration: update_guest — allow clearing/optional phone.
-- =============================================================================
-- phone was `COALESCE(p_phone, phone)` (null = keep), so an admin could never
-- CLEAR an existing phone. Now that phone is optional, treat it as a direct
-- replace (like message): blank/empty -> NULL actually clears it. Dedupe only
-- when a phone is provided. update_guest is always called with the full form, so
-- direct-replace is correct (no partial-update caller relies on null = keep).
--
-- Body is otherwise the live function unchanged. Signature reconstructed from
-- api.ts: (p_event_id uuid, p_id uuid, p_name text, p_phone text,
-- p_guest_count integer, p_message text, p_status event_rsvp_status,
-- p_invite_code text) RETURNS event_rsvps. If the live signature differs,
-- `select pg_get_functiondef('public.update_guest'::regproc)` and we match it.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_guest(
  p_event_id    uuid,
  p_id          uuid,
  p_name        text               DEFAULT NULL,
  p_phone       text               DEFAULT NULL,
  p_guest_count integer            DEFAULT NULL,
  p_message     text               DEFAULT NULL,
  p_status      event_rsvp_status  DEFAULT NULL,
  p_invite_code text               DEFAULT NULL
)
RETURNS event_rsvps
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller     event_members;
  v_invitation event_invitation;
  v_rsvp       event_rsvps;
  v_phone      text;
BEGIN
  SELECT * INTO v_rsvp FROM event_rsvps WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Guest not found';
  END IF;

  IF v_rsvp.event_id != p_event_id THEN
    RAISE EXCEPTION 'Guest does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'guests', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update guests';
  END IF;

  SELECT * INTO v_invitation
  FROM event_invitation
  WHERE event_id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF p_guest_count IS NOT NULL THEN
    IF p_guest_count < v_invitation.guest_count_min THEN
      RAISE EXCEPTION 'Guest count must be at least %', v_invitation.guest_count_min;
    END IF;

    IF p_guest_count > v_invitation.guest_count_max THEN
      RAISE EXCEPTION 'Guest count cannot exceed %', v_invitation.guest_count_max;
    END IF;
  END IF;

  -- Blank/empty -> NULL so clearing actually clears (and no-phone rows don't
  -- collide on UNIQUE(event_id, phone)).
  v_phone := NULLIF(btrim(p_phone), '');

  -- Dedupe only when a phone is provided and it's changing.
  IF v_phone IS NOT NULL AND v_phone IS DISTINCT FROM v_rsvp.phone THEN
    IF EXISTS (
      SELECT 1 FROM event_rsvps
      WHERE event_id = p_event_id
        AND phone    = v_phone
        AND id      != p_id
    ) THEN
      RAISE EXCEPTION 'A guest with this phone number already exists';
    END IF;
  END IF;

  UPDATE event_rsvps
  SET
    name         = COALESCE(p_name, name),
    phone        = v_phone,  -- direct replace: allows clearing
    guest_count  = COALESCE(p_guest_count, guest_count),
    message      = p_message,
    status       = COALESCE(p_status, status),
    invite_code  = COALESCE(p_invite_code, invite_code),
    confirmed_at = CASE
      WHEN p_status = 'confirmed'                          THEN now()
      WHEN p_status IS NOT NULL AND p_status != 'confirmed' THEN NULL
      ELSE confirmed_at
    END,
    cancelled_at = CASE
      WHEN p_status = 'cancelled'                          THEN now()
      WHEN p_status IS NOT NULL AND p_status != 'cancelled' THEN NULL
      ELSE cancelled_at
    END
  WHERE id = p_id
  RETURNING * INTO v_rsvp;

  RETURN v_rsvp;
END;
$$;

-- Rollback: restore phone = COALESCE(p_phone, phone) and the original
-- p_phone-based dedup (drop v_phone).
