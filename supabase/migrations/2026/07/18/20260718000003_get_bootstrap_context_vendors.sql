-- Migration: get_bootstrap_context — emit the 'vendors' feature flag
-- =============================================================================
-- Re-pastes the current body (20260630000104) verbatim; the only new lines add
-- 'vendors' -> can_use_vendors to BOTH features maps (the event's own plan, and
-- each catalog tier for the upgrade diff). No new limit/usage — vendors has no
-- cap. Placed next to gifts (the other Pro feature flag).
-- =============================================================================
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
  SELECT * INTO v_event FROM events WHERE slug = p_slug AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;

  SELECT * INTO v_member FROM event_members
  WHERE event_id = v_event.id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;

  IF v_member.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_SUSPENDED: Your access to this event has been suspended';
  END IF;
  IF v_member.joined_at IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_access_group FROM event_access_groups WHERE id = v_member.access_group_id;
  SELECT date_start, date_end INTO v_start, v_end FROM events_with_dates WHERE id = v_event.id;
  SELECT * INTO v_plan FROM plans WHERE key = effective_plan_key(v_event.id);

  RETURN json_build_object(
    'event_id',   v_event.id,
    'slug',       v_event.slug,
    'event_name', v_event.name,
    'date_start', v_start,
    'date_end',   v_end,
    'member', json_build_object(
      'id', v_member.id, 'display_name', v_member.display_name, 'role', v_member.role,
      'is_root', v_member.is_root, 'is_bride', v_member.is_bride, 'is_groom', v_member.is_groom
    ),
    'access_group', json_build_object(
      'id', v_access_group.id, 'name', v_access_group.name, 'permissions', v_access_group.permissions
    ),
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
        'max_gifts',            v_plan.max_gifts,
        'max_expenses',         v_plan.max_expenses,
        'max_timeline_items',   v_plan.max_timeline_items,
        'max_tasks',            v_plan.max_tasks
      ),
      'features', json_build_object(
        'timeline',         v_plan.can_use_timeline,
        'timeline_liverun', v_plan.can_use_timeline_liverun,
        'tasks',            v_plan.can_use_tasks,
        'members',          v_plan.can_use_members,
        'access',           v_plan.can_use_access,
        'guests',           v_plan.can_use_guests,
        'budget',           v_plan.can_use_budget,
        'gifts',            v_plan.can_use_gifts,
        'vendors',          v_plan.can_use_vendors,           -- NEW
        'invitation',       v_plan.can_use_invitation,
        'branding',         v_plan.can_remove_branding
      ),
      'usage', json_build_object(
        'days',    (SELECT count(*) FROM event_days WHERE event_id = v_event.id),
        'guests',  (SELECT COALESCE(sum(guest_count), 0) FROM event_rsvps
                    WHERE event_id = v_event.id AND status <> 'cancelled'),
        'members', (SELECT count(*) FROM event_members WHERE event_id = v_event.id),
        'pages',   (SELECT count(*) FROM event_invitations WHERE event_id = v_event.id),
        'timeline_items', (SELECT count(*) FROM event_timelines WHERE event_id = v_event.id),
        'tasks',   (SELECT count(*) FROM event_tasks
                    WHERE event_id = v_event.id AND archived_at IS NULL)
      )
    ),
    'catalog', COALESCE((
      SELECT json_agg(json_build_object(
        'tier', tier, 'rank', rank, 'name', name, 'price', price, 'is_free_tier', is_free_tier,
        'limits', json_build_object(
          'max_days', max_days, 'max_segments_per_day', max_segments_per_day,
          'max_invitation_pages', max_invitation_pages, 'max_guests', max_guests,
          'max_members', max_members, 'max_gifts', max_gifts, 'max_expenses', max_expenses,
          'max_timeline_items', max_timeline_items,
          'max_tasks', max_tasks
        ),
        'features', json_build_object(
          'timeline', can_use_timeline, 'timeline_liverun', can_use_timeline_liverun,
          'tasks', can_use_tasks, 'members', can_use_members,
          'access', can_use_access, 'guests', can_use_guests, 'budget', can_use_budget,
          'gifts', can_use_gifts, 'vendors', can_use_vendors,
          'invitation', can_use_invitation, 'branding', can_remove_branding
        )
      ) ORDER BY rank)
      FROM plans WHERE is_active
    ), '[]'::json)
  );
END;
$$;

-- Rollback: re-paste get_bootstrap_context (20260630000104) WITHOUT the 'vendors'
-- keys in either features map.
