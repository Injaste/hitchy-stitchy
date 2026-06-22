-- Migration: Subscription plans (112) — rename is_event_over_plan → is_over_plan_limits
-- =============================================================================
-- Standardise the over-limit predicate's name end-to-end. "is_event_over_plan"
-- was vague ("over plan" what?); "is_over_plan_limits" reads as a full thought
-- and matches the client field (isOverPlanLimits) + bootstrap key. Pure rename —
-- the body/semantics are unchanged.
--
-- ALTER ... RENAME keeps the function's GRANT, but its two plpgsql callers bind
-- the name late (at call time), so they must be re-pasted to point at the new
-- name or they'd raise "function does not exist". The bootstrap also renames its
-- JSON key 'is_over' → 'is_over_plan_limits' to match.
-- =============================================================================

-- 1) Rename the predicate (grant follows the object).
ALTER FUNCTION public.is_event_over_plan(uuid) RENAME TO is_over_plan_limits;

-- 2) Caller 1 — the whole-event over-limit lock (re-paste of 104 body, new name).
CREATE OR REPLACE FUNCTION public.assert_within_plan(p_event_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF is_over_plan_limits(p_event_id) THEN
    RAISE EXCEPTION 'This event is over your Free plan''s limits. Remove items to get back within limits, or upgrade to Pro to restore everything.'
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

-- 3) Caller 2 — the bootstrap RPC (re-paste of 110 body verbatim; only the
--    predicate call + its json key change).
CREATE OR REPLACE FUNCTION public.get_bootstrap_context(p_slug text)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_event        events;
  v_member       event_members;
  v_access_group event_access_groups;
  v_start        date;
  v_end          date;
  v_plan         plans;
BEGIN
  SELECT * INTO v_event
  FROM events WHERE slug = p_slug AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_member
  FROM event_members
  WHERE event_id = v_event.id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF v_member.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_SUSPENDED: Your access to this event has been suspended';
  END IF;

  IF v_member.joined_at IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_access_group
  FROM event_access_groups WHERE id = v_member.access_group_id;

  -- Span derived from event_days (single source of truth).
  SELECT date_start, date_end INTO v_start, v_end
  FROM events_with_dates WHERE id = v_event.id;

  -- The effective plan version in force for this event.
  SELECT * INTO v_plan FROM plans WHERE key = effective_plan_key(v_event.id);

  RETURN json_build_object(
    'event_id',   v_event.id,
    'slug',       v_event.slug,
    'event_name', v_event.name,
    'date_start', v_start,
    'date_end',   v_end,
    'member', json_build_object(
      'id',           v_member.id,
      'display_name', v_member.display_name,
      'role',         v_member.role,
      'is_root',      v_member.is_root,
      'is_bride',     v_member.is_bride,
      'is_groom',     v_member.is_groom
    ),
    'access_group', json_build_object(
      'id',          v_access_group.id,
      'name',        v_access_group.name,
      'permissions', v_access_group.permissions
    ),
    -- plan entitlements (UX gating only — RLS + RPCs are the real boundary).
    -- activated_at NULL = pending payment; is_over_plan_limits = over the caps.
    'plan', json_build_object(
      'key',                 v_plan.key,
      'tier',                v_plan.tier,
      'name',                v_plan.name,
      'activated_at',        v_event.activated_at,
      'is_over_plan_limits', is_over_plan_limits(v_event.id),
      'limits', json_build_object(
        'max_days',             v_plan.max_days,
        'max_segments_per_day', v_plan.max_segments_per_day,
        'max_invitation_pages', v_plan.max_invitation_pages,
        'max_guests',           v_plan.max_guests,
        'max_members',          v_plan.max_members,
        -- NB: cancelled_grace_pct is deliberately NOT exposed — it's an internal
        -- anti-abuse parameter; revealing it would hand users the loophole size.
        'can_use_budget',       v_plan.can_use_budget,
        'can_use_gifts',        v_plan.can_use_gifts,
        'can_remove_branding',  v_plan.can_remove_branding
      ),
      'usage', json_build_object(
        'days',    (SELECT count(*) FROM event_days WHERE event_id = v_event.id),
        'guests',  (SELECT COALESCE(sum(guest_count), 0) FROM event_rsvps
                    WHERE event_id = v_event.id AND status <> 'cancelled'),
        'members', (SELECT count(*) FROM event_members WHERE event_id = v_event.id),
        'pages',   (SELECT count(*) FROM event_invitations WHERE event_id = v_event.id)
      )
    )
  );
END;
$$;

-- Rollback:
--   ALTER FUNCTION public.is_over_plan_limits(uuid) RENAME TO is_event_over_plan;
--   then re-paste 104's assert_within_plan + 110's get_bootstrap_context
--   (predicate call is_event_over_plan + json key 'is_over').
