-- Migration: propagate access group code/rank to the client
-- =============================================================================
-- get_bootstrap_context and get_members only ever shipped { id, name,
-- permissions } for a member's access group. Two client fragilities followed
-- from that gap: MemberCreateModal resolved its default group by matching the
-- display LABEL ("Helper"), and policy.ts's client-side rank was inferred from
-- permissions.members === 'full' rather than the real rank column (fixed
-- client-side already; this migration supplies the data it needs).
--
-- Both bodies below are re-pastes of the CONFIRMED LIVE definitions (pulled
-- directly from the DB, not the repo) — the only change in each is adding
-- `code` and `rank` to the access-group JSON object.
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
      'id', v_access_group.id, 'code', v_access_group.code, 'name', v_access_group.name,
      'rank', v_access_group.rank, 'permissions', v_access_group.permissions
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
        'vendors',          v_plan.can_use_vendors,
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

CREATE OR REPLACE FUNCTION public.get_members(p_event_id uuid)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_caller     event_members;
  v_is_manager boolean;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  v_is_manager := is_super_admin(v_caller)
    OR has_event_permission(p_event_id, 'members', 'update');

  RETURN COALESCE((
    SELECT json_agg(
      json_build_object(
        -- roster basics — every member
        'id',              m.id,
        'event_id',        m.event_id,
        'access_group_id', m.access_group_id,
        'display_name',    m.display_name,
        'role',            m.role,
        'is_root',         m.is_root,
        'is_bride',        m.is_bride,
        'is_groom',        m.is_groom,
        'joined_at',       m.joined_at,          -- distinguishes active vs pending
        'created_at',      m.created_at,
        'updated_at',      m.updated_at,
        'notes',           m.notes,
        -- audit / moderation — managers only
        'invited_at',      CASE WHEN v_is_manager THEN m.invited_at  ELSE NULL END,
        'invited_by',      CASE WHEN v_is_manager THEN m.invited_by  ELSE NULL END,
        'frozen_at',       CASE WHEN v_is_manager THEN m.frozen_at   ELSE NULL END,
        -- share link — managers, and only while the member is still pending
        'invite_token',      CASE WHEN v_is_manager AND m.joined_at IS NULL THEN m.invite_token      ELSE NULL END,
        'invite_expires_at', CASE WHEN v_is_manager AND m.joined_at IS NULL THEN m.invite_expires_at ELSE NULL END,
        'accessGroup',     CASE WHEN ag.id IS NOT NULL THEN json_build_object(
          'id',          ag.id,
          'event_id',    ag.event_id,
          'code',        ag.code,
          'name',        ag.name,
          'rank',        ag.rank,
          'permissions', ag.permissions,
          'created_at',  ag.created_at,
          'updated_at',  ag.updated_at
        ) ELSE NULL END
      )
      ORDER BY m.created_at ASC
    )
    FROM event_members m
    LEFT JOIN event_access_groups ag ON ag.id = m.access_group_id
    WHERE m.event_id = p_event_id
      -- non-managers never see frozen members
      AND (v_is_manager OR m.frozen_at IS NULL)
  ), '[]'::json);
END;
$$;

-- Rollback: re-paste both bodies (this file, minus the code/rank keys) — the
-- confirmed-live bodies above ARE the rollback target for everything except
-- those two keys.
