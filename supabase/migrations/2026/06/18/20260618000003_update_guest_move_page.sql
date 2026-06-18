-- Admin guest edit: allow moving a guest to a different invitation page.
-- =============================================================================
-- update_guest validated party-size + phone-dedup against the guest's CURRENT
-- page and couldn't repoint it. Add p_invitation_id (default = keep current). When
-- a different page is given, limits + dedup are re-checked against the TARGET and
-- the row is moved. ADDITIVE: the deployed frontend omits the new arg, so the page
-- is unchanged and existing edits behave exactly as before (count/phone only
-- re-validated when actually changed). Signature change -> drop + recreate.
-- Also drops the now-dead p_invite_code arg + the invite_code write (the per-row
-- code is retired — the column itself is dropped in 20260618000005).
-- =============================================================================
DROP FUNCTION IF EXISTS public.update_guest(
  uuid, uuid, text, text, integer, text, event_rsvp_status, text
);

CREATE OR REPLACE FUNCTION public.update_guest(
  p_event_id uuid, p_id uuid, p_name text DEFAULT NULL, p_phone text DEFAULT NULL,
  p_guest_count integer DEFAULT NULL, p_message text DEFAULT NULL,
  p_status event_rsvp_status DEFAULT NULL, p_invitation_id uuid DEFAULT NULL
)
RETURNS event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller     event_members;
  v_inv        event_invitations;
  v_rsvp       event_rsvps;
  v_phone      text;
  v_target_inv uuid;
  v_count      integer;
  v_moving     boolean;
BEGIN
  SELECT * INTO v_rsvp FROM event_rsvps WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Guest not found'; END IF;
  IF v_rsvp.event_id != p_event_id THEN RAISE EXCEPTION 'Guest does not belong to this event'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'guests', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update guests'; END IF;

  -- Target page = the requested move, else the current page. Limits + dedup are
  -- checked against the TARGET so a move re-validates against its destination.
  v_target_inv := COALESCE(p_invitation_id, v_rsvp.invitation_id);
  v_moving := v_target_inv IS DISTINCT FROM v_rsvp.invitation_id;
  SELECT * INTO v_inv FROM event_invitations WHERE id = v_target_inv AND event_id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found for this event'; END IF;

  -- Party size must fit the target page when the count changes OR the page moves.
  v_count := COALESCE(p_guest_count, v_rsvp.guest_count);
  IF p_guest_count IS NOT NULL OR v_moving THEN
    IF v_count < v_inv.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min; END IF;
    IF v_count > v_inv.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max; END IF;
  END IF;

  -- Phone dedup on the target page, when the phone changes OR the page moves.
  v_phone := NULLIF(btrim(p_phone), '');
  IF v_phone IS NOT NULL
     AND (v_phone IS DISTINCT FROM v_rsvp.phone OR v_moving)
     AND EXISTS (
       SELECT 1 FROM event_rsvps
       WHERE invitation_id = v_target_inv AND phone = v_phone AND id != p_id
     ) THEN
    RAISE EXCEPTION 'A guest with this phone number already exists'; END IF;

  UPDATE event_rsvps
  SET name          = COALESCE(p_name, name),
      phone         = v_phone,
      guest_count   = COALESCE(p_guest_count, guest_count),
      message       = p_message,
      status        = COALESCE(p_status, status),
      invitation_id = v_target_inv,
      confirmed_at  = CASE WHEN p_status='confirmed' THEN now() WHEN p_status IS NOT NULL AND p_status!='confirmed' THEN NULL ELSE confirmed_at END,
      cancelled_at  = CASE WHEN p_status='cancelled' THEN now() WHEN p_status IS NOT NULL AND p_status!='cancelled' THEN NULL ELSE cancelled_at END
  WHERE id = p_id
  RETURNING * INTO v_rsvp;
  RETURN v_rsvp;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_guest(
  uuid, uuid, text, text, integer, text, event_rsvp_status, uuid
) TO authenticated;

-- Rollback: restore the 8-arg body from 20260617000006 (with p_invite_code,
-- no p_invitation_id) + re-add event_rsvps.invite_code (20260618000005 rollback).
