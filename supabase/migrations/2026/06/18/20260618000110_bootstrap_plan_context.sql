-- Migration: Subscription plans (110) — plan entitlements in get_bootstrap_context
-- =============================================================================
-- Additively returns a `plan` object in the admin bootstrap payload so the
-- client can gate UX (usage meters, read-only modules, over-limit / pending
-- banners) in one round-trip — UX only; the server RPCs remain the boundary.
-- get_bootstrap_context is an authed RPC (not a public-page one) and this is
-- purely additive (the live FE ignores the new key), so it's replaced in place.
-- Re-pastes the live 20260611000005 body verbatim; only the v_plan resolve and
-- the `plan` json key are new.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_bootstrap_context(p_slug text)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_event        events;
  v_member       event_members;
  v_access_group event_access_groups;
  v_start        date;
  v_end          date;
  v_plan         plans;   -- NEW
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

  -- NEW: the effective plan version in force for this event.
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
    -- NEW: plan entitlements (UX gating only — RLS + RPCs are the real boundary).
    -- activated_at NULL = pending payment; is_over = over the effective caps.
    'plan', json_build_object(
      'key',          v_plan.key,
      'tier',         v_plan.tier,
      'name',         v_plan.name,
      'activated_at', v_event.activated_at,
      'is_over',      is_event_over_plan(v_event.id),
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

-- Rollback: re-paste the pre-plan body (drop v_plan + the 'plan' json key).
