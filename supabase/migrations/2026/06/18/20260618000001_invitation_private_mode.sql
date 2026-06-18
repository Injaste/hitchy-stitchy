-- Step 4: private RSVP mode — shared per-page code + phone-matched reserved seats.
-- =============================================================================
-- Model (per docs/todo/invitation/redesign.md, refined): an invitation page can be
--   * public  — anyone may RSVP (unchanged).
--   * private — RSVP is gated. The couple pre-loads the guest list (admin Guests UI,
--     status='pending', source='private') and broadcasts ONE shared code per page.
--     A guest unlocks by submitting their PHONE (identifies their reserved row) +
--     the shared CODE (the gate). On success their pending row flips to confirmed.
--   * both    — public-open AND has reserved seats: a phone that matches a reserved
--     row must use the code to claim it; everyone else RSVPs freely.
--
-- The code is a PER-PAGE shared secret stored on event_invitations.private_code. It
-- is NEVER returned by get_public_invitation (no leak) — the guest types it and the
-- server validates here. Phone is the per-guest identity; the code is the gate.
--
-- Pre-loaded pending seats already count toward max_guests (capacity = SUM over
-- status != 'cancelled'), so a reserved seat is held before it's confirmed. Claiming
-- one re-checks capacity EXCLUDING the row being claimed (its seats are already in
-- the sum).
--
-- Touches two LIVE RPCs (post-cutover canonical names): update_invitation (+arg) and
-- submit_rsvp (rewritten private/both paths). create_guests is unchanged — its
-- per-row invite_code simply goes unused by the unlock (the page code is the gate).
-- =============================================================================

-- 1) Per-page shared gate code. NULL for public pages.
ALTER TABLE public.event_invitations ADD COLUMN IF NOT EXISTS private_code text;

-- 2) update_invitation — add p_private_code (12 -> 13 args). Require a code whenever
--    the (effective) mode is private or both; store NULL otherwise. Signature change,
--    so drop the old function first.
DROP FUNCTION IF EXISTS public.update_invitation(
  uuid, uuid, text, jsonb, event_rsvp_mode, timestamptz,
  integer, integer, integer, text, jsonb, boolean
);

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

  -- A private/both page needs a gate code; a public page stores none.
  v_mode := COALESCE(p_rsvp_mode, v_inv.rsvp_mode);
  v_code := NULLIF(btrim(p_private_code), '');
  IF v_mode IN ('private', 'both') AND v_code IS NULL THEN
    RAISE EXCEPTION 'A private code is required for private or both RSVP mode';
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
    private_code         = CASE WHEN v_mode IN ('private', 'both') THEN v_code ELSE NULL END,
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

-- 3) submit_rsvp — rewritten private/both handling. Same signature (uuid, jsonb,
--    text); p_invite_code now carries the page's shared code. Shared validation
--    (active/published/required fields/deadline/bounds/message) runs first, then the
--    mode branches. Guards preserved at every step.
CREATE OR REPLACE FUNCTION public.submit_rsvp(
  p_invitation_id uuid, p_fields jsonb, p_invite_code text DEFAULT NULL
)
RETURNS event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_inv      event_invitations;
  v_rsvp     event_rsvps;
  v_reserved event_rsvps;
  v_total    integer;
  v_name     text;
  v_phone    text;
  v_guest_count integer;
  v_message  text;
  v_code     text;
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

  -- A reserved (pre-loaded, private) seat for this phone on this page, any status.
  SELECT * INTO v_reserved FROM event_rsvps
  WHERE invitation_id = p_invitation_id AND phone = v_phone AND source = 'private'
  LIMIT 1;

  -- ── PRIVATE: reserved-only, gated by the shared page code. ──────────────────
  IF v_inv.rsvp_mode = 'private' THEN
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

  -- ── BOTH: a reserved phone must claim with the code; otherwise public insert. ─
  IF v_inv.rsvp_mode = 'both' AND v_reserved.id IS NOT NULL THEN
    IF v_code IS NULL OR v_inv.private_code IS NULL OR upper(v_code) <> upper(v_inv.private_code) THEN
      RAISE EXCEPTION 'You''re on the guest list — open your private invite link to confirm'; END IF;

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

  -- ── PUBLIC (and BOTH with no reserved seat): a fresh submission. ─────────────
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

-- Rollback:
--   ALTER TABLE public.event_invitations DROP COLUMN private_code;
--   (restore update_invitation 12-arg + submit_rsvp from 20260617000006/000007)
