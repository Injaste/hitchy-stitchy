-- Migration: let reserved guests claim their RSVP regardless of stored phone spacing
-- =============================================================================
-- Phase C-3a hotfix (docs/ux/phase-c-creation-and-lists.md, finding 1 + C-3a).
-- create_guest and import_guests store phone with its spaces intact
-- (NULLIF(btrim(...))); submit_rsvp looks a reserved guest up with all
-- whitespace stripped. A guest on a private page entered as "+65 9123 4567"
-- can never claim their own RSVP — the raw-equality lookup silently never
-- matches. This is live now, not a duplicate-detection nicety.
--
-- Step 0: phone_key() — a shared normaliser, purely additive, no gate. Not
-- inlined at the call sites: this migration already needs the expression four
-- times, C-3 needs it in more functions again, and the client half is already
-- shared (phoneKey in src/lib/phone.ts) — inlining the SQL half would leave
-- the two sides of the same rule defined differently. IMMUTABLE also keeps a
-- functional index — ON event_rsvps (invitation_id, phone_key(phone)) —
-- available later.
--
-- submit_rsvp is live and anon-granted (the guest-facing RSVP path), so it is
-- CREATE OR REPLACE, same signature — full body reproduced from the
-- confirmed-live shape (verified against the deployed function before
-- editing: matches 20260628000101_rsvp_block_after_event_date.sql
-- byte-for-byte). Four call sites now go through phone_key() instead of
-- inlining regexp_replace:
--   1. Input normalisation — v_phone := phone_key(trim(p_fields->>'phone')).
--   2. Reserved lookup — compares the stored phone normalised, not raw.
--   3. Claim UPDATE — writes phone = v_phone, so the row becomes canonical
--      the moment it's claimed. This is the load-bearing line: update_rsvp,
--      cancel_rsvp and get_rsvp all compare raw and would otherwise lock the
--      guest out again at the very next step, without needing to touch any
--      of those three functions.
--   4. Public duplicate check — same normalisation, so an admin-entered
--      guest doesn't get a second row when they RSVP themselves.
--
-- Deliberately NOT swept here: import_guests carries two more inline copies
-- of the same expression, and update_rsvp/create_guest/update_guest still
-- compare or store raw. Repointing any of those widens a hotfix that is
-- currently one live function. That is C-3, not this hotfix — see the doc's
-- "No other function needs touching — verified, not assumed" section for why
-- update_rsvp/cancel_rsvp/get_rsvp are safe to leave as they are: by the time
-- they run, the row has already been through a claim and is canonical.
--
-- Rows self-heal on first claim. No backfill: unclaimed rows keep their raw
-- phone, and create_guest/update_guest/import_guests still store raw.
-- =============================================================================

-- ── phone_key — shared phone normaliser, mirrors TS phoneKey (src/lib/phone.ts) ──
CREATE OR REPLACE FUNCTION public.phone_key(p_phone text)
RETURNS text LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT regexp_replace($1, '\s+', '', 'g')
$$;

-- ── submit_rsvp — C-3a: reserved guests claim via phone_key(), not raw equality ──
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
  v_phone       := phone_key(trim(p_fields->>'phone'));   -- C-3a: was inline regexp_replace
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
    -- C-3a: match by normalised phone — create_guest/import_guests store phone raw
    SELECT * INTO v_reserved FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND phone_key(phone) = v_phone
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

    -- C-3a: write the normalised phone back so the row is canonical after claim
    UPDATE event_rsvps SET name = v_name, phone = v_phone, guest_count = v_guest_count, message = v_message,
      status = 'confirmed', confirmed_at = now(), cancelled_at = NULL
    WHERE id = v_reserved.id RETURNING * INTO v_rsvp;
    RETURN v_rsvp;
  END IF;

  -- PUBLIC: open RSVP.
  -- C-3a: normalise here too, so an admin-entered guest can't get a second row
  IF EXISTS (SELECT 1 FROM event_rsvps WHERE invitation_id = p_invitation_id AND phone_key(phone) = v_phone AND status <> 'cancelled') THEN
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

-- Rollback: DROP FUNCTION public.phone_key(text); and CREATE OR REPLACE
-- submit_rsvp with the confirmed-live body from
-- 20260628000101_rsvp_block_after_event_date.sql — revert v_phone's
-- assignment, the reserved lookup, and the public duplicate check to inline
-- `regexp_replace(phone, '\s+', '', 'g')` / plain `phone = v_phone`, and drop
-- `phone = v_phone` from the claim UPDATE's SET list.
