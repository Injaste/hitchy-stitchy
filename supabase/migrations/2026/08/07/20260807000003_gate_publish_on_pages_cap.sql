-- Migration: gate publish on the pages cap
-- =============================================================================
-- Phase C-1 follow-up. 20260807000001 moved the 'pages' plan cap from counting
-- every row to counting PUBLISHED rows (so a seeded/edited draft is free), with
-- a total-row ceiling (2n+2) as the anti-abuse bound on the ADD path
-- (create_invitation). But publishing was never gated at all — update_invitation
-- has no assert_plan('pages') call on ANY revision back to its creation. That
-- was survivable while the cap counted every row (create_invitation already
-- blocked the extra row from existing), but moving the cap to published-only
-- reopened it: a Starter event (1 page) can create N drafts inside the 2n+2
-- total ceiling, then publish every one of them, uncontested.
--
-- Proved live on the 'starter' test event (max_invitation_pages = 1): created 2
-- drafts (within the 4-row ceiling), called update_invitation(p_to_publish:=true)
-- on both — both published. is_over_plan_limits only catches it AFTER the fact
-- (freezes the whole event), by which point both pages are public.
--
-- Fix: assert_plan('pages', 1) on the transition draft -> published only
-- (v_inv.published_at IS NULL AND p_to_publish). Republishing an
-- already-published page (editing content, or un/re-publish) claims no new
-- slot, so it isn't gated — matches how plan_within_limits('pages') itself
-- only counts a row once, at the moment published_at is first set.
--
-- Re-paste of the confirmed-live body (20260628000103) — the only change is the
-- new assert_plan call, marked NEW.
-- =============================================================================

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

  -- NEW: only the draft -> published transition claims a page slot. Editing an
  -- already-published page, or any change with p_to_publish = false, is free.
  IF p_to_publish AND v_inv.published_at IS NULL THEN
    PERFORM assert_plan(p_event_id, 'pages', 1);
  END IF;

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

-- Rollback: re-paste 20260628000103's update_invitation (no assert_plan on publish).
