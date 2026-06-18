-- Remove the "both" RSVP mode — pages are now purely public or private.
-- =============================================================================
-- "both" (open RSVP + reserved seats on one page) was the only reason for the
-- per-guest type toggle, the ?private link variant, and the branching submit path.
-- Dropping it collapses the model: a page's mode fully defines its guests' source
-- (private→reserved, public→public).
--
-- The `event_rsvp_mode` enum keeps its 'both' value (Postgres can't cleanly drop
-- one) but nothing produces it anymore; these bodies treat any stray 'both' page
-- defensively as private. The `source` column stays (now == page mode, derived).
--
-- CREATE OR REPLACE on four live RPCs; signatures + grants unchanged. Bodies are
-- the live shapes (submit_rsvp/update_invitation from 20260618000001,
-- create_guest_on_pages/update_guest from 20260618000007) with the both-logic cut.
-- =============================================================================

-- ── submit_rsvp — drop the both branch; reserved lookup folded into private ────
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

  IF v_guest_count < v_inv.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min; END IF;
  IF v_guest_count > v_inv.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max; END IF;

  IF COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'visible')::boolean, false)
     AND COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'required')::boolean, false)
     AND v_message IS NULL THEN
    RAISE EXCEPTION 'Message is required'; END IF;

  -- ── PRIVATE: reserved-only, gated by the shared page code. ──────────────────
  IF v_inv.rsvp_mode = 'private' THEN
    SELECT * INTO v_reserved FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND phone = v_phone AND source = 'private'
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

  -- ── PUBLIC: open RSVP. ──────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM event_rsvps WHERE invitation_id = p_invitation_id AND phone = v_phone AND status <> 'cancelled') THEN
    RAISE EXCEPTION 'You have already submitted an RSVP. Please contact the event organiser for changes'; END IF;

  IF v_inv.max_guests IS NOT NULL THEN
    SELECT COALESCE(SUM(guest_count), 0) INTO v_total FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND status <> 'cancelled';
    IF v_total + v_guest_count > v_inv.max_guests THEN RAISE EXCEPTION 'Sorry, this event has reached maximum capacity'; END IF;
  END IF;

  -- Reactivate a previously cancelled row for this phone, else insert a new one.
  IF EXISTS (SELECT 1 FROM event_rsvps WHERE invitation_id = p_invitation_id AND phone = v_phone AND status = 'cancelled') THEN
    UPDATE event_rsvps SET name = v_name, guest_count = v_guest_count, message = v_message,
      status = 'confirmed', confirmed_at = now(), cancelled_at = NULL
    WHERE invitation_id = p_invitation_id AND phone = v_phone RETURNING * INTO v_rsvp;
    RETURN v_rsvp;
  END IF;

  INSERT INTO event_rsvps (event_id, invitation_id, name, phone, guest_count, message, source, status, confirmed_at)
  VALUES (v_inv.event_id, p_invitation_id, v_name, v_phone, v_guest_count, v_message, 'public', 'confirmed', now())
  RETURNING * INTO v_rsvp;
  RETURN v_rsvp;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_rsvp(uuid, jsonb, text) TO anon, authenticated;

-- ── update_invitation — code required / stored only for private (was private/both)
CREATE OR REPLACE FUNCTION public.update_invitation(
  p_event_id            uuid,
  p_id                  uuid,
  p_template_key        text,
  p_draft_config        jsonb,
  p_rsvp_mode           event_rsvp_mode,
  p_rsvp_deadline       timestamptz,
  p_max_guests          integer,
  p_guest_count_min     integer,
  p_guest_count_max     integer,
  p_confirmation_message text,
  p_rsvp_config         jsonb,
  p_private_code        text DEFAULT NULL,
  p_to_publish          boolean DEFAULT false
)
RETURNS event_invitations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_inv    event_invitations;
  v_mode   event_rsvp_mode;
  v_code   text;
BEGIN
  SELECT * INTO v_inv FROM event_invitations WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_inv.event_id != p_event_id THEN
    RAISE EXCEPTION 'Invitation does not belong to this event'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'invitation', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update the invitation'; END IF;

  IF COALESCE(p_guest_count_max, v_inv.guest_count_max)
     < COALESCE(p_guest_count_min, v_inv.guest_count_min) THEN
    RAISE EXCEPTION 'Maximum guests cannot be less than the minimum'; END IF;

  -- A private page needs a gate code; a public page stores none.
  v_mode := COALESCE(p_rsvp_mode, v_inv.rsvp_mode);
  v_code := NULLIF(btrim(p_private_code), '');
  IF v_mode = 'private' AND v_code IS NULL THEN
    RAISE EXCEPTION 'A private code is required for private RSVP mode';
  END IF;

  UPDATE event_invitations SET
    template_key         = COALESCE(p_template_key, template_key),
    rsvp_deadline        = p_rsvp_deadline,
    max_guests           = p_max_guests,
    draft_config         = COALESCE(p_draft_config, draft_config),
    rsvp_mode            = COALESCE(p_rsvp_mode, rsvp_mode),
    guest_count_min      = COALESCE(p_guest_count_min, guest_count_min),
    guest_count_max      = COALESCE(p_guest_count_max, guest_count_max),
    confirmation_message = COALESCE(NULLIF(btrim(p_confirmation_message), ''), confirmation_message),
    rsvp_config          = COALESCE(p_rsvp_config, rsvp_config),
    private_code         = CASE WHEN v_mode = 'private' THEN v_code ELSE NULL END,
    published_config     = CASE WHEN p_to_publish THEN COALESCE(p_draft_config, draft_config) ELSE published_config END,
    published_at         = CASE WHEN p_to_publish THEN now() ELSE published_at END
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_invitation(
  uuid, uuid, text, jsonb, event_rsvp_mode, timestamptz, integer, integer, integer, text, jsonb, text, boolean
) TO authenticated;

-- ── create_guest_on_pages — source is the page mode (no both/toggle case) ─────
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
  v_status := COALESCE((p_guest->>'status')::event_rsvp_status, 'confirmed');
  v_count  := COALESCE((p_guest->>'guest_count')::integer, 1);

  FOREACH v_page IN ARRAY p_invitation_ids LOOP
    SELECT * INTO v_inv FROM event_invitations WHERE id = v_page AND event_id = p_event_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found for this event'; END IF;

    -- The page's mode defines the type (public→public, else reserved).
    v_source := CASE WHEN v_inv.rsvp_mode = 'public'
                     THEN 'public'::event_rsvp_source
                     ELSE 'private'::event_rsvp_source END;

    -- A reserved guest is matched by phone when they claim, so phone is required.
    IF v_source = 'private' AND v_phone IS NULL THEN
      RAISE EXCEPTION 'A reserved guest needs a phone number'; END IF;

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

-- ── update_guest — on a move, source follows the destination page's mode ──────
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
  v_source     event_rsvp_source;
BEGIN
  SELECT * INTO v_rsvp FROM event_rsvps WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Guest not found'; END IF;
  IF v_rsvp.event_id != p_event_id THEN RAISE EXCEPTION 'Guest does not belong to this event'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'guests', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update guests'; END IF;

  v_target_inv := COALESCE(p_invitation_id, v_rsvp.invitation_id);
  v_moving := v_target_inv IS DISTINCT FROM v_rsvp.invitation_id;
  SELECT * INTO v_inv FROM event_invitations WHERE id = v_target_inv AND event_id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found for this event'; END IF;

  -- On a move, the destination's mode redefines the type; otherwise keep current.
  IF v_moving THEN
    v_source := CASE WHEN v_inv.rsvp_mode = 'public'
                     THEN 'public'::event_rsvp_source
                     ELSE 'private'::event_rsvp_source END;
  ELSE
    v_source := v_rsvp.source;
  END IF;

  v_count := COALESCE(p_guest_count, v_rsvp.guest_count);
  IF p_guest_count IS NOT NULL OR v_moving THEN
    IF v_count < v_inv.guest_count_min THEN RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min; END IF;
    IF v_count > v_inv.guest_count_max THEN RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max; END IF;
  END IF;

  v_phone := NULLIF(btrim(p_phone), '');
  IF v_source = 'private' AND v_phone IS NULL THEN
    RAISE EXCEPTION 'A reserved guest needs a phone number'; END IF;
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
      source        = v_source,
      invitation_id = v_target_inv,
      confirmed_at  = CASE WHEN p_status='confirmed' THEN now() WHEN p_status IS NOT NULL AND p_status!='confirmed' THEN NULL ELSE confirmed_at END,
      cancelled_at  = CASE WHEN p_status='cancelled' THEN now() WHEN p_status IS NOT NULL AND p_status!='cancelled' THEN NULL ELSE cancelled_at END
  WHERE id = p_id
  RETURNING * INTO v_rsvp;
  RETURN v_rsvp;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_guest(uuid, uuid, text, text, integer, text, event_rsvp_status, uuid) TO authenticated;

-- Rollback: re-run 20260618000001 (submit_rsvp/update_invitation) + 20260618000007
--   (create_guest_on_pages/update_guest) to restore the both-aware bodies.
