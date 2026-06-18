-- Corrective: reconcile update_guest + create_guest_on_pages after the column drop.
-- =============================================================================
-- An intermediate deploy applied earlier versions of 20260618000003 / ...0004
-- (which still WROTE invite_code) and then 20260618000005 dropped the column —
-- leaving both functions referencing event_rsvps.invite_code, which no longer
-- exists (they error on call: Add Guest / Copy-to-pages / Edit Guest).
--
-- Re-assert both at their final, invite_code-free shape. Idempotent: drops every
-- update_guest signature that could be live (the interim 9-arg WITH p_invite_code,
-- and the final 8-arg) before recreating the 8-arg, and CREATE OR REPLACEs
-- create_guest_on_pages. Safe to run on a fresh DB too.
-- =============================================================================

-- ── update_guest — final 8-arg (move-aware, no invite_code) ──────────────────
DROP FUNCTION IF EXISTS public.update_guest(uuid, uuid, text, text, integer, text, event_rsvp_status, text, uuid);
DROP FUNCTION IF EXISTS public.update_guest(uuid, uuid, text, text, integer, text, event_rsvp_status, uuid);

CREATE FUNCTION public.update_guest(
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

  -- Target page = the requested move, else the current page; limits + dedup are
  -- checked against the TARGET so a move re-validates against its destination.
  v_target_inv := COALESCE(p_invitation_id, v_rsvp.invitation_id);
  v_moving := v_target_inv IS DISTINCT FROM v_rsvp.invitation_id;
  SELECT * INTO v_inv FROM event_invitations WHERE id = v_target_inv AND event_id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found for this event'; END IF;

  v_count := COALESCE(p_guest_count, v_rsvp.guest_count);
  IF p_guest_count IS NOT NULL OR v_moving THEN
    IF v_count < v_inv.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min; END IF;
    IF v_count > v_inv.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max; END IF;
  END IF;

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
GRANT EXECUTE ON FUNCTION public.update_guest(uuid, uuid, text, text, integer, text, event_rsvp_status, uuid) TO authenticated;

-- ── create_guest_on_pages — re-assert without the invite_code insert ─────────
CREATE OR REPLACE FUNCTION public.create_guest_on_pages(p_event_id uuid, p_invitation_ids uuid[], p_guest jsonb)
RETURNS SETOF event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_inv    event_invitations;
  v_rsvp   event_rsvps;
  v_page   uuid;
  v_name   text;
  v_phone  text;
  v_source event_rsvp_source;
  v_status event_rsvp_status;
  v_count  integer;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'guests', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create guests'; END IF;
  IF p_invitation_ids IS NULL OR array_length(p_invitation_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'Select at least one invitation page'; END IF;

  v_name := NULLIF(btrim(p_guest->>'name'), '');
  IF v_name IS NULL THEN RAISE EXCEPTION 'Guest must have a name'; END IF;
  v_phone  := NULLIF(btrim(p_guest->>'phone'), '');
  v_source := COALESCE((p_guest->>'source')::event_rsvp_source, 'private');
  v_status := COALESCE((p_guest->>'status')::event_rsvp_status, 'confirmed');
  v_count  := COALESCE((p_guest->>'guest_count')::integer, 1);

  FOREACH v_page IN ARRAY p_invitation_ids LOOP
    SELECT * INTO v_inv FROM event_invitations WHERE id = v_page AND event_id = p_event_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found for this event'; END IF;

    IF v_count < v_inv.guest_count_min THEN
      RAISE EXCEPTION 'Guest count must be at least % on every selected page', v_inv.guest_count_min; END IF;
    IF v_count > v_inv.guest_count_max THEN
      RAISE EXCEPTION 'Guest count cannot exceed % on every selected page', v_inv.guest_count_max; END IF;
    IF v_phone IS NOT NULL AND EXISTS (
      SELECT 1 FROM event_rsvps WHERE invitation_id = v_page AND phone = v_phone
    ) THEN
      RAISE EXCEPTION 'A guest with phone % already exists on a selected page', v_phone; END IF;

    INSERT INTO event_rsvps (
      event_id, invitation_id, name, phone, guest_count, message, source, status, confirmed_at, cancelled_at
    )
    VALUES (
      p_event_id, v_page, v_name, v_phone, v_count, p_guest->>'message',
      v_source, v_status,
      CASE WHEN v_status = 'confirmed' THEN now() ELSE NULL END,
      CASE WHEN v_status = 'cancelled' THEN now() ELSE NULL END
    )
    RETURNING * INTO v_rsvp;
    RETURN NEXT v_rsvp;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_guest_on_pages(uuid, uuid[], jsonb) TO authenticated;

-- Rollback: none needed — these are the canonical final bodies.
