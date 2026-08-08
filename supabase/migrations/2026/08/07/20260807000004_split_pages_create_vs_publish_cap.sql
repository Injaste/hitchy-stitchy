-- Migration: split the page-limit check by what actually changes plan exposure
-- =============================================================================
-- Two DIFFERENT things consume plan capacity, and each needs its own check:
--   1. CREATE   — a new row exists now. Total rows (draft + seed + published)
--                 must stay within the abuse ceiling (max_invitation_pages*2+2).
--   2. PUBLISH  — a row becomes publicly visible. Checked ONLY on the draft ->
--                 published transition, against the max PUBLISHABLE cap
--                 (max_invitation_pages) alone.
-- A plain draft edit (content/RSVP settings, p_to_publish=false or already
-- published) does neither — no row added, nothing newly public — so it has
-- no plan check at all. update_invitation never had one before this migration
-- and still doesn't need one outside the publish transition.
--
-- Bug found live-testing 20260807000003 on 'zzz-gate-test' (Starter, cap 1):
-- created + published one draft (correct), then a SECOND, harmless draft
-- failed to even CREATE. Cause: 20260807000001 made plan_within_limits('pages')
-- check the max-publishable cap too, on every call — so once 1 page was
-- published, creating any further draft got blocked by the publish cap, which
-- should only apply at publish time.
--
-- Fix: two resource keys instead of one formula serving both call sites.
--   'pages'          — create_invitation's check: total-row ceiling only.
--   'pages_publish'  — update_invitation's check: max-publishable cap only,
--                       fired only on the draft -> published transition.
--
-- Also extracts the ceiling formula itself (max_invitation_pages * 2 + 2) into
-- max_total_invitation_pages() — a named function instead of inlined math, so
-- there's one place to change the ratio if it ever does.
--
-- create_invitation is untouched (already calls assert_plan('pages', 1) — same
-- key, now correctly scoped). update_invitation's publish check (added in
-- 20260807000003) has its resource key corrected here. Re-paste of
-- plan_within_limits (20260807000001) and update_invitation (20260807000003).
-- =============================================================================

-- The abuse-ceiling formula, named instead of inlined. One place to change the
-- ratio; every caller (today: just plan_within_limits('pages')) reads it by
-- name instead of retyping the math.
CREATE OR REPLACE FUNCTION public.max_total_invitation_pages(p_max_invitation_pages int)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT p_max_invitation_pages * 2 + 2;
$$;

CREATE OR REPLACE FUNCTION public.plan_within_limits(
  p_event_id uuid,
  p_resource text,
  p_adding   int  DEFAULT 1,
  p_scope_id uuid DEFAULT NULL
)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_plan  plans;
  v_used  int;
  v_total int;
BEGIN
  SELECT p.* INTO v_plan FROM plans p WHERE p.key = effective_plan_key(p_event_id);
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  CASE p_resource
    -- feature flags
    WHEN 'budget'   THEN RETURN v_plan.can_use_budget;
    WHEN 'gifts'    THEN RETURN v_plan.can_use_gifts;
    WHEN 'vendors'  THEN RETURN v_plan.can_use_vendors;
    WHEN 'branding' THEN RETURN v_plan.can_remove_branding;

    -- numeric caps
    WHEN 'guests' THEN
      SELECT COALESCE(sum(guest_count) FILTER (WHERE status <> 'cancelled'), 0),
             COALESCE(sum(guest_count), 0)
        INTO v_used, v_total
        FROM event_rsvps WHERE event_id = p_event_id;
      RETURN v_used  + p_adding <= v_plan.max_guests
         AND v_total + p_adding <= floor(v_plan.max_guests * (1 + v_plan.cancelled_grace_pct));

    WHEN 'days' THEN
      SELECT count(*) INTO v_used FROM event_days WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_days;

    WHEN 'segments' THEN
      SELECT count(*) INTO v_used
      FROM event_segments WHERE day_id = p_scope_id AND name IS NOT NULL;
      RETURN v_used + p_adding <= v_plan.max_segments_per_day;

    -- NEW: create-only — total rows bounded by the abuse ceiling. Only
    -- create_invitation calls this (p_adding=1, a row is being added); a plain
    -- draft edit adds no row and has no plan check at all.
    WHEN 'pages' THEN
      SELECT count(*) INTO v_total
      FROM event_invitations WHERE event_id = p_event_id;
      RETURN v_total + p_adding <= max_total_invitation_pages(v_plan.max_invitation_pages);

    -- NEW: rule 3 (publish) — max PUBLISHABLE pages only. Called by
    -- update_invitation solely on the draft -> published transition.
    WHEN 'pages_publish' THEN
      SELECT count(*) FILTER (WHERE published_at IS NOT NULL)
        INTO v_used
        FROM event_invitations WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_invitation_pages;

    WHEN 'members' THEN
      SELECT count(*) INTO v_used
      FROM event_members WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_members;

    WHEN 'timeline_items' THEN
      SELECT count(*) INTO v_used
      FROM event_timelines WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_timeline_items;

    WHEN 'expenses' THEN
      SELECT count(*) INTO v_used
      FROM event_expenses WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_expenses;

    WHEN 'gift_envelopes' THEN
      SELECT count(*) INTO v_used
      FROM event_gifts WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_gifts;

    WHEN 'tasks' THEN
      SELECT count(*) INTO v_used
      FROM event_tasks WHERE event_id = p_event_id AND archived_at IS NULL;
      RETURN v_used + p_adding <= v_plan.max_tasks;

    ELSE
      RAISE EXCEPTION 'Unknown plan resource: %', p_resource;
  END CASE;
END;
$$;

-- update_invitation — re-paste of 20260807000003's body; only the resource key
-- on the publish-gate call changes ('pages' -> 'pages_publish').
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

  -- NEW: the only plan check update_invitation needs. A plain draft edit
  -- inserts no row and changes nothing publicly visible, so it has no plan
  -- exposure to gate. Publishing is the one thing that does — it's the moment
  -- a row starts counting against max_invitation_pages — so that's the only
  -- transition checked, and only against the publish cap (not the total-row
  -- ceiling, which is create_invitation's concern, not this row's).
  IF p_to_publish AND v_inv.published_at IS NULL THEN
    PERFORM assert_plan(p_event_id, 'pages_publish', 1);
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
    published_config     = CASE WHEN p_to_publish THEN COALESCE(p_draft_config, draft_config) ELSE published_config END,
    published_at         = CASE WHEN p_to_publish THEN COALESCE(p_publish_at, now()) ELSE published_at END
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

-- Rollback: re-paste plan_within_limits (20260807000001 body, inlined math, no
-- max_total_invitation_pages call) and update_invitation (20260807000003 body) —
-- single 'pages' key, no 'pages_publish' branch. DROP FUNCTION
-- public.max_total_invitation_pages(int) once nothing references it.
