-- Admin: add one guest to one or more invitation pages, atomically.
-- =============================================================================
-- The admin guest form can target several pages at once (the same person invited
-- to e.g. Nikah AND Reception). A guest is one event_rsvps row per page, and
-- phone-dedup is per-page, so the same phone legitimately appears on each page.
--
-- This NEW function inserts one row per page in a single transaction: if ANY page
-- fails validation (party-size out of that page's bounds, or the phone already
-- exists there), the whole call rolls back — no partial adds. Per-page validation
-- mirrors create_guests.
--
-- Additive (brand-new function, no existing RPC touched). create_guests stays for
-- the single-page/bulk paths.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_guest_on_pages(
  p_event_id uuid, p_invitation_ids uuid[], p_guest jsonb
)
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
      event_id, invitation_id, name, phone, guest_count, message,
      source, status, confirmed_at, cancelled_at
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

-- Rollback: DROP FUNCTION public.create_guest_on_pages(uuid, uuid[], jsonb);
