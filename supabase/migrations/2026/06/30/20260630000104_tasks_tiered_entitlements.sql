-- Migration: tasks tiered entitlements (Phase 2 of granular gating)
-- =============================================================================
-- Mirrors the timeline phase, minus a sub-feature (tasks has no live-run-style
-- lever — drag/assignees/priorities are core board basics, not gateable). So:
-- open the tasks module to every tier + a per-tier count cap.
--
--   1) OPEN THE FLOOR — can_use_tasks = true for Starter/Plus. The existing
--      plan_gate_tasks trigger (enforce_plan_feature('tasks')) then permits their
--      writes; once every tier has it, that trigger is an inert safety net.
--   2) PER-TIER CAP — max_tasks (25 / 75 / 300 / 1500). Counts NON-archived tasks
--      (archived = off the board, shouldn't eat the cap). Enforced at create via
--      assert_plan('tasks') + a plan_within_limits branch; client mirrors with a
--      useLimitGuard at the add-task entry points.
--
-- Re-pastes are verbatim current bodies (plan_within_limits = 20260630000102;
-- create_task = 20260610000201; get_bootstrap_context = 20260630000101) with
-- only the `-- NEW`-marked lines added.
-- =============================================================================

BEGIN;

-- 1) Schema + seed: per-tier cap, open the module to the floor.
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_tasks int NOT NULL DEFAULT 0;

UPDATE public.plans SET max_tasks = 25,   can_use_tasks = true WHERE key = 'solo_1_v1'; -- Starter
UPDATE public.plans SET max_tasks = 75,   can_use_tasks = true WHERE key = 'solo_2_v1'; -- Plus
UPDATE public.plans SET max_tasks = 300                        WHERE key = 'solo_3_v1'; -- Pro
UPDATE public.plans SET max_tasks = 1500                       WHERE key = 'solo_4_v1'; -- Advanced

-- 2) plan_within_limits — re-paste (20260630000102) + a 'tasks' count branch.
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

    WHEN 'pages' THEN
      SELECT count(*) INTO v_used
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

    WHEN 'tasks' THEN                                   -- NEW: per-tier task cap
      SELECT count(*) INTO v_used
      FROM event_tasks WHERE event_id = p_event_id AND archived_at IS NULL;
      RETURN v_used + p_adding <= v_plan.max_tasks;

    ELSE
      RAISE EXCEPTION 'Unknown plan resource: %', p_resource;
  END CASE;
END;
$$;

-- 3) create_task — re-paste (20260610000201) + the task-count assert. The feature
--    gate is the existing plan_gate_tasks trigger; this adds the per-tier cap.
CREATE OR REPLACE FUNCTION public.create_task(
  p_event_id  uuid,
  p_title     text,
  p_details   text DEFAULT NULL,
  p_priority  event_task_priority DEFAULT NULL,
  p_due_at    date DEFAULT NULL,
  p_assignees uuid[] DEFAULT NULL,
  p_label     text DEFAULT NULL,
  p_status    event_task_status DEFAULT 'todo'
)
RETURNS event_tasks
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_task   event_tasks;
BEGIN
  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  PERFORM assert_plan(p_event_id, 'tasks');   -- NEW: per-tier task cap

  PERFORM assert_added_assignees_assignable(p_event_id, p_assignees, '{}'::uuid[]);

  INSERT INTO event_tasks (
    event_id, title, details, priority, due_at,
    assignees, created_by, label, status, completed_at, position
  )
  VALUES (
    p_event_id, p_title, p_details, p_priority, p_due_at,
    COALESCE(p_assignees, '{}'), v_caller.id, p_label, p_status,
    CASE WHEN p_status = 'done' THEN now() ELSE NULL END,
    (SELECT COALESCE(max(position), 0) + 1000
       FROM event_tasks
      WHERE event_id = p_event_id
        AND status = p_status
        AND archived_at IS NULL)
  )
  RETURNING * INTO v_task;

  RETURN v_task;
END;
$$;

-- 4) get_bootstrap_context — re-paste (20260630000101) + emit max_tasks (limits)
--    and tasks usage (non-archived), for plan + catalog.
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
        'max_tasks',            v_plan.max_tasks                   -- NEW
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
                    WHERE event_id = v_event.id AND archived_at IS NULL)   -- NEW
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
          'max_tasks', max_tasks                                  -- NEW
        ),
        'features', json_build_object(
          'timeline', can_use_timeline, 'timeline_liverun', can_use_timeline_liverun,
          'tasks', can_use_tasks, 'members', can_use_members,
          'access', can_use_access, 'guests', can_use_guests, 'budget', can_use_budget,
          'gifts', can_use_gifts, 'invitation', can_use_invitation, 'branding', can_remove_branding
        )
      ) ORDER BY rank)
      FROM plans WHERE is_active
    ), '[]'::json)
  );
END;
$$;

COMMIT;

-- Rollback:
--   ALTER TABLE public.plans DROP COLUMN max_tasks;
--   UPDATE public.plans SET can_use_tasks = false WHERE key IN ('solo_1_v1','solo_2_v1');
--   Re-paste plan_within_limits (20260630000102), create_task (20260610000201) and
--   get_bootstrap_context (20260630000101) WITHOUT the `-- NEW` lines.
