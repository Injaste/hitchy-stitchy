-- Migration: Subscription plans (106) — plan gates on the create_* RPCs
-- =============================================================================
-- Adds the entitlement gates to day / segment / invitation-page / member
-- creation. All four are authed admin RPCs (not on the public-page danger list),
-- so they're replaced in place. Each keeps its existing membership/permission
-- checks verbatim; the only additions are two guards after them:
--   • assert_event_writable — event is paid/active AND not over plan limits.
--   • assert_plan(resource)  — adding one more is within the plan's cap.
-- delete_* / update_* are handled separately; deletes stay ungated.
-- =============================================================================

-- ── create_day — multi-day is a Pro cap (Free max_days = 1) ──────────────────
CREATE OR REPLACE FUNCTION public.create_day(p_event_id uuid, p_date date, p_label text)
RETURNS event_days LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day event_days;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to add days';
  END IF;

  PERFORM assert_event_writable(p_event_id);   -- NEW
  PERFORM assert_plan(p_event_id, 'days', 1);  -- NEW

  IF p_date IS NULL THEN
    RAISE EXCEPTION 'A date is required';
  END IF;

  IF btrim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'A label is required';
  END IF;

  IF EXISTS (SELECT 1 FROM event_days WHERE event_id = p_event_id AND date = p_date) THEN
    RAISE EXCEPTION 'That day is already on the schedule';
  END IF;

  INSERT INTO event_days (event_id, date, label)
  VALUES (p_event_id, p_date, btrim(p_label))
  RETURNING * INTO v_day;

  INSERT INTO event_segments (event_id, day_id, name, sort_order)
  VALUES (p_event_id, v_day.id, NULL, 0);

  RETURN v_day;
END;
$$;

-- ── create_segment — per-day named-segment cap ───────────────────────────────
CREATE OR REPLACE FUNCTION public.create_segment(p_event_id uuid, p_day_id uuid, p_name text)
RETURNS event_segments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg   event_segments;
  v_order integer;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to add segments';
  END IF;

  PERFORM assert_event_writable(p_event_id);   -- NEW

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'Segment name is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM event_days WHERE id = p_day_id AND event_id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Day not found for this event';
  END IF;

  PERFORM assert_plan(p_event_id, 'segments', 1, p_day_id);  -- NEW (after day validated)

  SELECT COALESCE(max(sort_order), -1) + 1 INTO v_order
  FROM event_segments WHERE day_id = p_day_id;

  INSERT INTO event_segments (event_id, day_id, name, sort_order)
  VALUES (p_event_id, p_day_id, btrim(p_name), v_order)
  RETURNING * INTO v_seg;

  RETURN v_seg;
END;
$$;

-- ── create_invitation — invitation-page cap (Free = 1 root page) ──────────────
CREATE OR REPLACE FUNCTION public.create_invitation(
  p_event_id uuid, p_template_key text, p_day_id uuid, p_segment_id uuid DEFAULT null, p_link_slug text DEFAULT null
)
RETURNS event_invitations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_caller event_members; v_config jsonb; v_inv event_invitations; v_slug text := NULLIF(btrim(lower(p_link_slug)), '');
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'invitation', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create an invitation'; END IF;
  PERFORM assert_event_writable(p_event_id);     -- NEW
  PERFORM assert_plan(p_event_id, 'pages', 1);   -- NEW
  IF NOT EXISTS (SELECT 1 FROM event_days WHERE id = p_day_id AND event_id = p_event_id) THEN
    RAISE EXCEPTION 'Day not found for this event'; END IF;
  IF p_segment_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM event_segments WHERE id = p_segment_id AND day_id = p_day_id AND event_id = p_event_id) THEN
    RAISE EXCEPTION 'Segment not found for this day'; END IF;
  IF v_slug IS NULL THEN
    IF EXISTS (SELECT 1 FROM event_invitations WHERE event_id = p_event_id AND link_slug IS NULL) THEN
      RAISE EXCEPTION 'A root link already exists — choose a link path'; END IF;
  ELSE
    IF v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN RAISE EXCEPTION 'Link path may use only lowercase letters, numbers and hyphens'; END IF;
    IF EXISTS (SELECT 1 FROM slug_reservations WHERE slug = v_slug AND expires_at IS NULL) THEN
      RAISE EXCEPTION 'That link path is reserved'; END IF;  -- permanent slug_reservations entry
    IF EXISTS (SELECT 1 FROM event_invitations WHERE event_id = p_event_id AND link_slug = v_slug) THEN
      RAISE EXCEPTION 'That link path is already in use'; END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM event_invitations WHERE event_id = p_event_id AND day_id = p_day_id AND segment_id IS NOT DISTINCT FROM p_segment_id) THEN
    RAISE EXCEPTION 'An invitation already exists for this day/segment'; END IF;
  SELECT field_config INTO v_config FROM event_templates WHERE template_key = p_template_key AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Template not found or inactive'; END IF;
  INSERT INTO event_invitations (event_id, day_id, segment_id, template_key, link_slug, draft_config)
  VALUES (p_event_id, p_day_id, p_segment_id, p_template_key, v_slug, COALESCE(v_config, '{}'::jsonb))
  RETURNING * INTO v_inv;
  RETURN v_inv;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_invitation(uuid, text, uuid, uuid, text) TO authenticated;

-- ── create_member — collaborator cap ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_member(
  p_event_id        uuid,
  p_display_name    text,
  p_access_group_id uuid,
  p_role            text DEFAULT NULL::text,
  p_notes           text DEFAULT NULL::text,
  p_couple          text DEFAULT NULL::text   -- 'bride' | 'groom' | null
)
RETURNS event_members
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_access_group event_access_groups;
  v_caller       event_members;
  v_result       event_members;
BEGIN
  SELECT * INTO v_access_group
  FROM event_access_groups
  WHERE id = p_access_group_id AND event_id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access group not found in this event';
  END IF;

  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'members', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create members';
  END IF;

  PERFORM assert_event_writable(p_event_id);      -- NEW
  PERFORM assert_plan(p_event_id, 'members', 1);  -- NEW

  INSERT INTO event_members (
    event_id, display_name, access_group_id,
    role, notes, invited_at, invited_by
  )
  VALUES (
    p_event_id, p_display_name, p_access_group_id,
    p_role, p_notes, now(), v_caller.id
  )
  RETURNING * INTO v_result;

  -- Delegate couple assignment (same transaction → atomic with the insert).
  IF p_couple IN ('bride', 'groom') THEN
    v_result := update_member_couple(p_event_id, v_result.id, p_couple);
  END IF;

  RETURN v_result;
END;
$$;

-- Rollback: re-paste each function's pre-gate body (remove the two PERFORM lines
-- from create_day / create_segment / create_invitation / create_member).
