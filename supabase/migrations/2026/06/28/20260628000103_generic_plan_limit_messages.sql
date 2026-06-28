-- Migration: make the last two plan-limit messages tier-agnostic
-- =============================================================================
-- assert_plan was already generic (20260627000103/105), but two live functions
-- still named retired tiers ("Free" / "Pro"):
--   • assert_within_plan      — the whole-event over-limit edit lock
--   • update_invitation       — the per-page guest-capacity clamp
-- Neither "Free" nor "Pro" is user-facing copy anymore (the ladder is Starter /
-- Plus / Pro / Advanced and may keep changing), so both now read generically and
-- lead with upgrade (the over-limit lock no longer coaches deletion). Same
-- signatures, behaviour IDENTICAL — only the RAISE message strings change. Bodies
-- are taken verbatim from the live
-- definitions (which had drifted past the repo: assert_within_plan still calls
-- is_over_plan_limits per 20260618000112; update_invitation is the scheduled-publish
-- body from 20260628000001 — this supersedes both for the message text only).
-- One transaction.
-- =============================================================================

BEGIN;

-- Whole-event over-limit lock — only reachable after a payment reversal
-- (dispute/chargeback or refund) drops the event to a lower tier. Body identical
-- to 20260618000112; the message drops the "Free"/"Pro" tier names AND now leads
-- with upgrade instead of coaching deletion. (Deleting still works — delete_ RPCs
-- are never gated — so the user isn't trapped; we just don't advertise it.)
CREATE OR REPLACE FUNCTION public.assert_within_plan(p_event_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF is_over_plan_limits(p_event_id) THEN
    RAISE EXCEPTION 'Your event is over your plan''s limits — upgrade your plan to unlock editing again.'
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

-- Invitation update. Body identical to 20260628000001 (scheduled publish); only the
-- per-page guest-capacity clamp message drops "Upgrade to Pro".
CREATE OR REPLACE FUNCTION public.update_invitation(
  p_event_id uuid,
  p_id uuid,
  p_template_key text,
  p_draft_config jsonb,
  p_rsvp_mode event_rsvp_mode,
  p_rsvp_deadline timestamptz,
  p_max_guests integer,
  p_guest_count_min integer,
  p_guest_count_max integer,
  p_confirmation_message text,
  p_rsvp_config jsonb,
  p_private_code text DEFAULT NULL,
  p_to_publish boolean DEFAULT false,
  p_publish_at timestamptz DEFAULT now()
)
RETURNS event_invitations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller     event_members;
  v_inv        event_invitations;
  v_mode       event_rsvp_mode;
  v_code       text;
  v_plan_cap   integer;
  v_max_guests integer;
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

  PERFORM assert_event_writable(p_event_id);   -- paid/active + not over-limit

  IF COALESCE(p_guest_count_max, v_inv.guest_count_max)
     < COALESCE(p_guest_count_min, v_inv.guest_count_min) THEN
    RAISE EXCEPTION 'Maximum guests cannot be less than the minimum'; END IF;

  v_mode := COALESCE(p_rsvp_mode, v_inv.rsvp_mode);
  v_code := NULLIF(btrim(p_private_code), '');
  IF v_mode = 'private' AND v_code IS NULL THEN
    RAISE EXCEPTION 'A private code is required for private RSVP mode';
  END IF;

  -- Page capacity can't exceed the plan cap; an unset cap DEFAULTS to it, so the
  -- per-page enforcement in submit_rsvp always carries the plan limit.
  SELECT max_guests INTO v_plan_cap FROM plans WHERE key = effective_plan_key(p_event_id);
  v_max_guests := COALESCE(p_max_guests, v_plan_cap);
  IF v_max_guests > v_plan_cap THEN
    RAISE EXCEPTION 'Guest capacity (%) can''t exceed your plan limit of %. Upgrade your plan for more.', v_max_guests, v_plan_cap;
  END IF;

  UPDATE event_invitations SET
    template_key         = COALESCE(p_template_key, template_key),
    rsvp_deadline        = p_rsvp_deadline,
    max_guests           = v_max_guests,
    draft_config         = COALESCE(p_draft_config, draft_config),
    rsvp_mode            = COALESCE(p_rsvp_mode, rsvp_mode),
    guest_count_min      = COALESCE(p_guest_count_min, guest_count_min),
    guest_count_max      = COALESCE(p_guest_count_max, guest_count_max),
    confirmation_message = COALESCE(NULLIF(btrim(p_confirmation_message), ''), confirmation_message),
    rsvp_config          = COALESCE(p_rsvp_config, rsvp_config),
    private_code         = CASE WHEN v_mode = 'private' THEN v_code ELSE NULL END,
    -- Atomic publish: promote the just-written draft in the same statement.
    -- p_publish_at may be in the future (scheduled publish) — the render gates
    -- on `published_at <= now()`, so the snapshot stays hidden until then.
    published_config     = CASE WHEN p_to_publish THEN COALESCE(p_draft_config, draft_config) ELSE published_config END,
    published_at         = CASE WHEN p_to_publish THEN COALESCE(p_publish_at, now()) ELSE published_at END
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

COMMIT;

-- Rollback: re-paste 20260618000112's assert_within_plan ("Free"/"Pro" message) and
-- 20260628000001's update_invitation ("Upgrade to Pro for more." clamp message).
