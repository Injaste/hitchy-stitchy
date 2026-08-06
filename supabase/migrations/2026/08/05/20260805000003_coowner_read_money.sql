-- Migration: Co-owner reads money — budget/gifts become permission resources
-- =============================================================================
-- Phase 1a of money delegation (reads only). Money moves ONTO the permission
-- map: the Co-owner group (code 'admin') gains budget:read + gifts:read, and the
-- money READ policies switch from the bespoke is_super_admin_member gate to the
-- canonical has_event_permission. Owner still passes via the superadmin bypass
-- inside has_event_permission; Helper has no budget/gifts key -> no access.
--
-- WRITES are deliberately untouched here — the money write-RPCs still require
-- is_super_admin (Owner only). Co-owner is read-only until Phase 1b upgrades the
-- grant to :full and swaps the write-RPCs. So Co-owner sees the numbers now, and
-- the FE keeps its write controls Owner-gated.
--
-- This consciously reverses the old "money is not a permission resource" stance
-- (money_access_model) — justified now that money is delegated. is_super_admin
-- keeps its two real jobs (the has_event_permission bypass = the Owner's
-- guarantee, and rank/protection); it just stops being the money-specific gate.
-- =============================================================================

-- 1. Grant budget/gifts READ on existing Co-owner groups.
UPDATE event_access_groups
SET permissions = permissions || '{"budget":"read","gifts":"read"}'::jsonb
WHERE code = 'admin';

-- 2. Money READ policies -> has_event_permission (Owner via bypass, Co-owner via
--    the map, Helper denied). Expenses read on the 'budget' resource.
DROP POLICY event_budget_select ON public.event_budget;
CREATE POLICY event_budget_select ON public.event_budget
  FOR SELECT TO authenticated
  USING (has_event_permission(event_id, 'budget', 'read'));

DROP POLICY event_expenses_select ON public.event_expenses;
CREATE POLICY event_expenses_select ON public.event_expenses
  FOR SELECT TO authenticated
  USING (has_event_permission(event_id, 'budget', 'read'));

DROP POLICY event_gifts_select ON public.event_gifts;
CREATE POLICY event_gifts_select ON public.event_gifts
  FOR SELECT TO authenticated
  USING (has_event_permission(event_id, 'gifts', 'read'));

-- 3. create_event — re-paste of the current body (20260805000002); the ONLY
--    change is budget:read + gifts:read added to the Co-owner group seed.
CREATE OR REPLACE FUNCTION public.create_event(
  p_slug         text,
  p_name         text,
  p_days         jsonb,
  p_display_name text,
  p_role         text
)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_event_id  uuid;
  v_slug      text;
  v_helper_id uuid;
  v_admin_id  uuid;
  v_member_id uuid;
  v_day_id    uuid;
  v_start     date;
  v_end       date;
  v_free_available boolean;   -- account's free ($0) event still available? (else pending pay)
  rec         record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  IF p_days IS NULL OR jsonb_array_length(p_days) = 0 THEN
    RAISE EXCEPTION 'Select at least one event day';
  END IF;

  IF is_slug_taken(p_slug) THEN
    RAISE EXCEPTION 'This URL is already taken' USING ERRCODE = 'unique_violation';
  END IF;

  SELECT min((d->>'date')::date), max((d->>'date')::date)
  INTO v_start, v_end
  FROM jsonb_array_elements(p_days) AS d;

  v_free_available := free_event_available(v_user_id);

  INSERT INTO events (slug, name, activated_at)
  VALUES (p_slug, p_name, CASE WHEN v_free_available THEN now() ELSE NULL END)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  -- Helper (default, no money) + Co-owner (money via the map). Co-owner reads
  -- budget/gifts; writes stay Owner-only until Phase 1b. Owner (root) needs no
  -- grant — the is_super_admin bypass covers money.
  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'helper', 'Helper', 3, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_helper_id;

  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'admin', 'Co-owner', 2, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read",
    "budget":"read","gifts":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  -- Creator (root/Owner) placed in Co-owner as the NOT NULL placeholder; the
  -- is_super_admin flag, not the group, grants their power.
  INSERT INTO event_members (
    event_id, user_id, display_name, access_group_id,
    role, is_root, is_bride, is_groom, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, p_display_name, v_admin_id,
    p_role, true, (p_role = 'Bride'), (p_role = 'Groom'), now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_settings (event_id) VALUES (v_event_id);
  -- (no event_budget seed — buckets are lazy, per day)

  FOR rec IN
    SELECT DISTINCT ON (dt) dt AS date, lbl AS label
    FROM (
      SELECT (d->>'date')::date              AS dt,
             btrim(COALESCE(d->>'label', '')) AS lbl
      FROM jsonb_array_elements(p_days) AS d
    ) s
    ORDER BY dt
  LOOP
    IF rec.label = '' THEN
      RAISE EXCEPTION 'Each event day needs a label';
    END IF;

    INSERT INTO event_days (event_id, date, label)
    VALUES (v_event_id, rec.date, rec.label)
    RETURNING event_days.id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);
  END LOOP;

  DELETE FROM slug_reservations WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, v_start, v_end, NOT v_free_available;
END;
$$;

-- Rollback: revoke budget/gifts from Co-owner groups, restore the 3 SELECT
-- policies to is_super_admin_member(event_id), and re-paste create_event
-- (20260805000002) without the budget/gifts keys on the Co-owner seed.
