-- Migration: remove the Team access group — Admin becomes the only group
-- =============================================================================
-- Role-choosing is being taken out of the invite flow: everyone you invite is
-- trusted, so every member defaults to Admin. The Access page and the group
-- picker are hidden on the client; here we retire Team on the backend so the two
-- sides stay honest — no dormant group nothing can ever land in.
--
-- The `access` resource, has_event_permission, and RLS are all untouched. This
-- only removes one seeded group and the two places that referenced it by name.
--
-- ORDER MATTERS. event_members.access_group_id is FK ON DELETE SET NULL, so
-- deleting a group that members still point at would SILENTLY null them out
-- (empty permissions = locked out of everything). So: reassign Team members to
-- Admin FIRST, then drop the group.
--
-- Two live-RPC body swaps, both same-signature CREATE OR REPLACE (no overloads):
--   * update_member_couple — demote target 'Team' → 'Admin'.
--   * create_event         — stop seeding the Team group.
-- create_member is deliberately NOT touched: with Admin the only group, its
-- existing `group ∈ event` validation already guarantees Admin.
-- =============================================================================

-- 1. update_member_couple — re-paste of the current body (20260613000202); the
--    ONLY change is the demote fallback group: 'Team' → 'Admin'.
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

  -- No longer couple/owner -> drop to the Admin group (the flag granted the
  -- power, so removing it must drop them to a real group). Admin is the only
  -- group and always exists (create_event seeds it), so no existence guard is
  -- needed — revisit if access groups ever become CRUD-able.
  IF NOT is_super_admin(v_member) THEN
    UPDATE event_members
    SET access_group_id = (
      SELECT id FROM event_access_groups
      WHERE event_id = p_event_id AND name = 'Admin'
    )
    WHERE id = p_id
    RETURNING * INTO v_member;
  END IF;

  RETURN v_member;
END;
$$;

-- 2. create_event — re-paste of the current body (20260718000004); the ONLY
--    change is removing the Team group seed (and its now-unused v_team_id).
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

  -- No budget/gifts grant — those are super-admin only (the couple), enforced by
  -- the RPCs/RLS; they stay in the catalog for discovery. Vendors is a delegated
  -- resource the Admin group manages fully. Admin is the only group now (Team
  -- retired in 20260805000001) — every invited member lands here.
  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

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

-- 3. Reassign every member currently in a Team group to that event's Admin group.
--    MUST run before the DELETE (FK is ON DELETE SET NULL — a bare delete would
--    silently orphan them to a null group = no permissions).
UPDATE event_members m
SET    access_group_id = a.id
FROM   event_access_groups t
JOIN   event_access_groups a
       ON a.event_id = t.event_id AND a.name = 'Admin'
WHERE  t.name = 'Team'
  AND  m.access_group_id = t.id;

-- 4. Now safe to drop the Team groups.
DELETE FROM event_access_groups WHERE name = 'Team';

-- Rollback: re-seed Team in create_event (20260718000004 body), repoint
-- update_member_couple's demote fallback back to 'Team' (20260613000202 body),
-- and re-insert a Team group per event. Members reassigned in step 3 are not
-- automatically restored — they'd stay in Admin.
