-- Migration: rename plan_allows -> plan_within_limits
-- =============================================================================
-- plan_has_feature (migration 104) now owns the feature-flag checks, so the old
-- name `plan_allows` read ambiguously. Rename it to `plan_within_limits` — it
-- answers "is [adding N of] this resource within the plan?" — and repoint its two
-- callers: assert_plan, and submit_rsvp (the public RSVP path, which checks the
-- guest cap directly with a guest-friendly message).
--
-- ALTER ... RENAME preserves the body + grants exactly (no cap-logic rewrite). Only
-- the name and the two call sites move; behaviour is identical.
--
-- NB: this re-defines submit_rsvp — after applying, smoke-test a public RSVP.
-- (Later, low-priority: plan_within_limits still also answers budget/gifts/branding
-- for assert_plan — that overlaps plan_has_feature. A future pass could trim it to
-- caps-only and route those features through plan_has_feature; left out here to
-- avoid rewriting the cap logic on an untested migration.)
-- =============================================================================

BEGIN;

ALTER FUNCTION public.plan_allows(uuid, text, int, uuid)
  RENAME TO plan_within_limits;

-- assert_plan — identical to 20260627000103, now calling the renamed function.
CREATE OR REPLACE FUNCTION public.assert_plan(
  p_event_id uuid,
  p_resource text,
  p_adding   int  DEFAULT 1,
  p_scope_id uuid DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF plan_within_limits(p_event_id, p_resource, p_adding, p_scope_id) THEN
    RETURN;
  END IF;

  RAISE EXCEPTION '%',
    CASE
      WHEN p_resource IN ('budget', 'gifts', 'branding')
        THEN 'This isn''t included in your plan. Upgrade your plan to use it.'
      ELSE 'You''ve reached your plan''s limit. Upgrade your plan for more.'
    END
    USING ERRCODE = 'check_violation';
END;
$$;

-- submit_rsvp — unchanged from 20260618000109 except the plan-cap call name
-- (plan_allows -> plan_within_limits, line marked NEW).
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

  -- PRIVATE: reserved-only. The reserved row already exists (counted at create),
  -- so no event-total plan cap here; the per-page max_guests check still applies.
  IF v_inv.rsvp_mode = 'private' THEN
    SELECT * INTO v_reserved FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND phone = v_phone
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

  -- PUBLIC: open RSVP.
  IF EXISTS (SELECT 1 FROM event_rsvps WHERE invitation_id = p_invitation_id AND phone = v_phone AND status <> 'cancelled') THEN
    RAISE EXCEPTION 'You have already submitted an RSVP. Please contact the event organiser for changes'; END IF;

  IF v_inv.max_guests IS NOT NULL THEN
    SELECT COALESCE(SUM(guest_count), 0) INTO v_total FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND status <> 'cancelled';
    IF v_total + v_guest_count > v_inv.max_guests THEN RAISE EXCEPTION 'Sorry, this event has reached maximum capacity'; END IF;
  END IF;

  -- plan cap (active + total-with-grace; guards pages with no max_guests set).
  -- Guest-friendly message — a public guest can't "upgrade".
  IF NOT plan_within_limits(v_inv.event_id, 'guests', v_guest_count) THEN   -- NEW: renamed from plan_allows
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

COMMIT;

-- Rollback: ALTER FUNCTION public.plan_within_limits(uuid, text, int, uuid) RENAME TO
-- plan_allows; re-paste 20260627000103's assert_plan + 20260618000109's submit_rsvp
-- (both calling plan_allows).
