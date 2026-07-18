-- Migration: plan_within_limits — add the 'vendors' feature branch
-- =============================================================================
-- Re-pastes the current body (20260630000104) verbatim; the only new line is the
-- `WHEN 'vendors'` feature-flag branch, so assert_plan(event, 'vendors') resolves
-- to the tier's can_use_vendors. No count branch — vendors has no cap.
-- =============================================================================
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
    WHEN 'vendors'  THEN RETURN v_plan.can_use_vendors;   -- NEW: vendors is a Pro feature
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

    WHEN 'tasks' THEN
      SELECT count(*) INTO v_used
      FROM event_tasks WHERE event_id = p_event_id AND archived_at IS NULL;
      RETURN v_used + p_adding <= v_plan.max_tasks;

    ELSE
      RAISE EXCEPTION 'Unknown plan resource: %', p_resource;
  END CASE;
END;
$$;

-- Rollback: re-paste plan_within_limits (20260630000104) WITHOUT the 'vendors' branch.
