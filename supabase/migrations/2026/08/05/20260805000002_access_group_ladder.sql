-- Migration: access group ladder — Helper / Co-owner (+ code/rank), no new powers
-- =============================================================================
-- Introduces the group ladder the delegation model needs, WITHOUT granting any
-- new access (money delegation is a separate, later migration). Groups gain:
--   * code — stable lowercase machine id ('helper' | 'admin'); logic/logs use it
--   * name — human label ('Helper' | 'Co-owner'); display only
--   * rank — ordering (lower = higher privilege)
--
-- Today's single 'Admin' group (full ops, no money — the Team-removal heir)
-- becomes 'helper' / "Helper". A new 'admin' / "Co-owner" group is added with
-- IDENTICAL permissions — the two differ ONLY by money, which is NOT granted
-- here (a code='admin' money gate lands in the money-delegation migration). So
-- this is behaviour-preserving: everyone stays put (now labelled Helper) and
-- Co-owner is an empty, assignable tier that grants nothing extra yet.
--
-- Deliberately NOT touched (they move in the money-delegation phase):
--   * get_bootstrap_context / get_members — the client reads `name` (the label);
--     `code` only needs to reach the client once the money gate keys off it.
--   * get_member_rank — Helper and Co-owner are equivalent until money exists,
--     so no rank change is warranted yet.
--
-- 'admin' is the code because it's the conventional machine term; the label
-- diverges to the friendlier "Co-owner". That divergence is exactly why the
-- code/name split exists — everywhere else code and label match.
-- =============================================================================

-- 1. Columns: code (identity) + rank (order). Nullable for the backfill, then
--    tightened.
ALTER TABLE event_access_groups ADD COLUMN code text;
ALTER TABLE event_access_groups ADD COLUMN rank int;

-- 2. Rename today's 'Admin' group in place → Helper (keeps its members + perms).
UPDATE event_access_groups
SET code = 'helper', name = 'Helper', rank = 3
WHERE name = 'Admin';

-- 3. Add a Co-owner group per event, cloning Helper's permissions (identical —
--    money lives on a code gate, not the map).
INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
SELECT event_id, 'admin', 'Co-owner', 2, permissions
FROM event_access_groups
WHERE code = 'helper';

-- 4. Move identity from name → code, so labels can be reworded without breaking
--    lookups. (Existing owners stay in the Helper group as a harmless cosmetic
--    placeholder — their power is the is_super_admin flag, not the group.)
ALTER TABLE event_access_groups ALTER COLUMN code SET NOT NULL;
ALTER TABLE event_access_groups DROP CONSTRAINT event_roles_event_id_name_key;
ALTER TABLE event_access_groups
  ADD CONSTRAINT event_access_groups_event_id_code_key UNIQUE (event_id, code);

-- 5. create_event — re-paste of the current body (20260805000001); changes:
--    seed BOTH groups (helper default + admin/Co-owner), and put the creator
--    (root) in Co-owner as the placeholder group.
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

  -- Two groups, identical permissions — they differ only by money, which is
  -- granted by a code='admin' gate (money-delegation migration), not the map.
  -- No budget/gifts here; those stay super-admin/couple-gated + delegated.
  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'helper', 'Helper', 3, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_helper_id;

  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'admin', 'Co-owner', 2, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  -- Creator is the Owner (is_root → is_super_admin). Placed in Co-owner as the
  -- NOT NULL placeholder; the flag, not the group, is what grants their power.
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

-- 6. update_member_couple — re-paste of the current body (20260805000001); the
--    ONLY change is the demote fallback group: name 'Admin' → code 'helper'.
CREATE OR REPLACE FUNCTION public.update_member_couple(
  p_event_id uuid,
  p_id       uuid,
  p_couple   text DEFAULT NULL::text   -- 'bride' | 'groom' | null
)
RETURNS event_members
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_target   event_members;
  v_caller   event_members;
  v_member   event_members;
  v_is_bride boolean := COALESCE(p_couple = 'bride', false);
  v_is_groom boolean := COALESCE(p_couple = 'groom', false);
BEGIN
  SELECT * INTO v_target FROM event_members WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Only the couple or event owner can assign couple roles';
  END IF;

  IF v_is_bride AND NOT v_target.is_bride THEN
    IF EXISTS (SELECT 1 FROM event_members WHERE event_id = p_event_id AND is_bride = true AND id != p_id) THEN
      RAISE EXCEPTION 'This event already has a bride';
    END IF;
  END IF;

  IF v_is_groom AND NOT v_target.is_groom THEN
    IF EXISTS (SELECT 1 FROM event_members WHERE event_id = p_event_id AND is_groom = true AND id != p_id) THEN
      RAISE EXCEPTION 'This event already has a groom';
    END IF;
  END IF;

  UPDATE event_members
  SET is_bride = v_is_bride,
      is_groom = v_is_groom
  WHERE id = p_id
  RETURNING * INTO v_member;

  -- No longer couple/owner -> drop to the Helper group (the flag granted the
  -- power, so removing it must drop them to a real group). Helper always exists
  -- (create_event seeds it), so no existence guard — revisit if access groups
  -- ever become CRUD-able.
  IF NOT is_super_admin(v_member) THEN
    UPDATE event_members
    SET access_group_id = (
      SELECT id FROM event_access_groups
      WHERE event_id = p_event_id AND code = 'helper'
    )
    WHERE id = p_id
    RETURNING * INTO v_member;
  END IF;

  RETURN v_member;
END;
$$;

-- Rollback: DROP the code/rank columns + code unique constraint (restore the
-- name unique), re-merge Co-owner back into a single 'Admin' group, and re-paste
-- create_event / update_member_couple from 20260805000001.
