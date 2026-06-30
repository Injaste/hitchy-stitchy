-- Migration: timeline tiered entitlements (Phase 1 of granular gating)
-- =============================================================================
-- Shifts the timeline from a whole-feature gate to a sub-feature + per-tier-limit
-- model:
--
--   1) OPEN THE FLOOR — the timeline module becomes available on every tier
--      (can_use_timeline = true for Starter/Plus). The existing plan_gate_timelines
--      trigger (enforce_plan_feature('timeline')) then permits their writes; no RPC
--      change is needed to "unlock" the module.
--
--   2) PER-TIER ITEM CAP — max_timeline_items (15 / 50 / 200 / 1000). Enforced
--      server-side at create time via assert_plan('timeline_items'), counted by
--      plan_within_limits (same shape as days/pages/members). NOT a whole-event
--      lock (deliberately excluded from is_over_plan_limits): like budget/gifts
--      data, being over the item cap blocks ADDING more, it doesn't freeze the
--      event — encourage upgrading, never force deletion.
--
--   3) LIVE-RUN SUB-FEATURE — running the day live (start/end cues = setting
--      started_at / ended_at) is gated to Pro+ via can_use_timeline_liverun.
--      Enforced by a NEW trigger that fires only on that transition, so regular
--      cue edits stay open on every tier. This mirrors the plan_gate_* trigger
--      pattern, so the start_timeline / end_timeline RPCs are left untouched.
--
-- Functions 3–6 below are re-pastes of their current bodies (plan_within_limits =
-- 20260618000104 renamed in 20260627000105; plan_has_feature = 20260627000104;
-- create_timeline = 20260610000201; get_bootstrap_context = 20260627000102) with
-- additive changes ONLY — each addition is marked `-- NEW`.
-- =============================================================================

BEGIN;

-- 1) Schema — two additive columns on plans (defaults keep existing rows valid).
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS max_timeline_items       int     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS can_use_timeline_liverun boolean NOT NULL DEFAULT false;

-- 2) Seed per tier + open the timeline module to the floor.
UPDATE public.plans SET max_timeline_items = 15                                    WHERE key = 'solo_1_v1'; -- Starter
UPDATE public.plans SET max_timeline_items = 50                                    WHERE key = 'solo_2_v1'; -- Plus
UPDATE public.plans SET max_timeline_items = 200,  can_use_timeline_liverun = true WHERE key = 'solo_3_v1'; -- Pro
UPDATE public.plans SET max_timeline_items = 1000, can_use_timeline_liverun = true WHERE key = 'solo_4_v1'; -- Advanced
-- Open the timeline module to every tier (live-run stays gated above).
UPDATE public.plans SET can_use_timeline = true WHERE key IN ('solo_1_v1', 'solo_2_v1');

-- 3) plan_within_limits — re-paste (104 body, renamed in 105) + a timeline_items
--    count branch. Everything else is verbatim.
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
      -- TWO caps: ACTIVE (non-cancelled) ≤ max_guests (the firm business limit),
      -- and TOTAL (incl cancelled) ≤ max_guests + the cancelled grace. So
      -- cancelled rows are free up to grace%, then they count — bounding the
      -- fake-cancelled loophole. Assumes the add is a live guest (the dominant
      -- path); a cancelled add is checked against active too (conservative/rare).
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
      -- named segments only; the auto-seeded NULL-name default doesn't count.
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

    WHEN 'timeline_items' THEN                          -- NEW: per-tier item cap
      SELECT count(*) INTO v_used
      FROM event_timelines WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_timeline_items;

    ELSE
      RAISE EXCEPTION 'Unknown plan resource: %', p_resource;
  END CASE;
END;
$$;

-- 4) plan_has_feature — re-paste (104 body) + the timeline_liverun flag.
CREATE OR REPLACE FUNCTION public.plan_has_feature(p_event_id uuid, p_feature text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT CASE p_feature
    WHEN 'timeline'         THEN can_use_timeline
    WHEN 'timeline_liverun' THEN can_use_timeline_liverun   -- NEW
    WHEN 'tasks'            THEN can_use_tasks
    WHEN 'members'          THEN can_use_members
    WHEN 'access'           THEN can_use_access
    WHEN 'budget'           THEN can_use_budget
    WHEN 'gifts'            THEN can_use_gifts
    WHEN 'branding'         THEN can_remove_branding
    ELSE false
  END
  FROM plans WHERE key = effective_plan_key(p_event_id);
$$;

-- 5) Live-run gate — NEW. The timeline MODULE is open to every tier (the existing
--    plan_gate_timelines trigger owns that); RUNNING it live (start/end a cue =
--    setting started_at / ended_at) is the gated sub-feature. Only that transition
--    is checked, so editing a cue's title/time stays open on every plan. Attached
--    BEFORE UPDATE only — INSERT lands started_at/ended_at NULL, and DELETE is the
--    cleanup valve.
CREATE OR REPLACE FUNCTION public.enforce_timeline_liverun()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (NEW.started_at IS DISTINCT FROM OLD.started_at AND NEW.started_at IS NOT NULL)
     OR (NEW.ended_at IS DISTINCT FROM OLD.ended_at AND NEW.ended_at IS NOT NULL) THEN
    IF NOT plan_has_feature(NEW.event_id, 'timeline_liverun') THEN
      RAISE EXCEPTION 'Running the day live is included on a higher plan. Upgrade your plan to run your timeline live.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS plan_gate_timeline_liverun ON public.event_timelines;
CREATE TRIGGER plan_gate_timeline_liverun BEFORE UPDATE ON public.event_timelines
  FOR EACH ROW EXECUTE FUNCTION public.enforce_timeline_liverun();

-- 6) create_timeline — re-paste (20260610000201 body) + the item-cap assert.
--    timeline_items falls through assert_plan's generic message ("You've reached
--    your plan's limit. Upgrade your plan for more."), so assert_plan is unchanged.
CREATE OR REPLACE FUNCTION public.create_timeline(
  p_event_id   uuid,
  p_segment_id uuid,
  p_label      text,
  p_time_start time without time zone,
  p_time_end   time without time zone,
  p_title      text,
  p_details    text,
  p_assignees  uuid[]
)
RETURNS event_timelines
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_item   event_timelines;
  v_day    date;
BEGIN
  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'timeline', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create timeline items';
  END IF;

  PERFORM assert_plan(p_event_id, 'timeline_items');   -- NEW: per-tier item cap

  IF p_time_end IS NOT NULL AND p_time_end <= p_time_start THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  PERFORM assert_added_assignees_assignable(p_event_id, p_assignees, '{}'::uuid[]);

  SELECT ed.date INTO v_day
  FROM event_segments es
  JOIN event_days ed ON ed.id = es.day_id
  WHERE es.id = p_segment_id AND es.event_id = p_event_id;

  IF v_day IS NULL THEN
    RAISE EXCEPTION 'Segment not found for this event';
  END IF;

  INSERT INTO event_timelines (
    event_id, segment_id, day, label, time_start, time_end, title, details, assignees
  )
  VALUES (
    p_event_id, p_segment_id, v_day, p_label, p_time_start, p_time_end, p_title, p_details, p_assignees
  )
  RETURNING * INTO v_item;

  RETURN v_item;
END;
$$;

-- 7) get_bootstrap_context — re-paste (20260627000102 body) + emit the new cap,
--    flag and usage count, for BOTH the active plan and each catalog tier.
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
        'max_timeline_items',   v_plan.max_timeline_items          -- NEW
      ),
      'features', json_build_object(
        'timeline',         v_plan.can_use_timeline,
        'timeline_liverun', v_plan.can_use_timeline_liverun,       -- NEW
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
        'timeline_items', (SELECT count(*) FROM event_timelines WHERE event_id = v_event.id)  -- NEW
      )
    ),
    -- the live ladder, enriched with each tier's caps + features (drives the
    -- upgrade diff: what the next tier unlocks / raises). price stays in the data
    -- but is NOT displayed anywhere in the app yet.
    'catalog', COALESCE((
      SELECT json_agg(json_build_object(
        'tier', tier, 'rank', rank, 'name', name, 'price', price, 'is_free_tier', is_free_tier,
        'limits', json_build_object(
          'max_days', max_days, 'max_segments_per_day', max_segments_per_day,
          'max_invitation_pages', max_invitation_pages, 'max_guests', max_guests,
          'max_members', max_members, 'max_gifts', max_gifts, 'max_expenses', max_expenses,
          'max_timeline_items', max_timeline_items                 -- NEW
        ),
        'features', json_build_object(
          'timeline', can_use_timeline, 'timeline_liverun', can_use_timeline_liverun,  -- NEW
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
--   DROP TRIGGER IF EXISTS plan_gate_timeline_liverun ON public.event_timelines;
--   DROP FUNCTION IF EXISTS public.enforce_timeline_liverun();
--   Re-paste plan_within_limits (20260618000104 body, renamed), plan_has_feature
--     (20260627000104), create_timeline (20260610000201) and get_bootstrap_context
--     (20260627000102) WITHOUT the `-- NEW` lines.
--   ALTER TABLE public.plans DROP COLUMN can_use_timeline_liverun, DROP COLUMN max_timeline_items;
--   UPDATE public.plans SET can_use_timeline = false WHERE key IN ('solo_1_v1','solo_2_v1');
