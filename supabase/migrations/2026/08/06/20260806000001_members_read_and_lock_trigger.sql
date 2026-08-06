-- Migration: Helper gets members:read + DB-level lock on non-admin members:full
-- =============================================================================
-- Two fixes to 20260805000005:
--
-- 1. Helper's 'members' key comes back as "read", not absent. Helper CAN see
--    the roster (get_members shows it to every active member unconditionally —
--    only manager-only audit fields, invite links etc., are gated) — the
--    permission map should say so, matching the 'access' resource's pattern
--    (read = visible, full = manageable). "read" grants no extra power: every
--    write RPC (create_member/update_member_access_group/delete_member/
--    freeze_member) requires 'full' specifically, so this is purely documentary
--    + a hedge against a future get_members visibility change.
--
-- 2. A trigger now enforces the "members is Owner+Co-owner only" rule at the DB
--    level, not just by convention. Previously this was safe only because no
--    group-CRUD path existed; if create/update_access_group ever return, this
--    trigger is what actually stops a non-admin group from being granted
--    members:full, regardless of what the RPC/UI layer does. Only caps the
--    ceiling (blocks 'full' on non-admin) — doesn't force a floor, so 'none' or
--    'read' on any group is still fine.
-- =============================================================================

-- 1. Helper: members "none" (absent) -> "read".
UPDATE event_access_groups
SET permissions = permissions || '{"members":"read"}'::jsonb
WHERE code = 'helper';

-- 2. Lock trigger: no group except code='admin' may hold members:full.
CREATE OR REPLACE FUNCTION public.enforce_members_admin_only()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.permissions ->> 'members' = 'full' AND NEW.code <> 'admin' THEN
    RAISE EXCEPTION 'Only the admin (Co-owner) group may hold members:full';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_access_groups_lock_members ON event_access_groups;
CREATE TRIGGER event_access_groups_lock_members
  BEFORE INSERT OR UPDATE ON event_access_groups
  FOR EACH ROW EXECUTE FUNCTION public.enforce_members_admin_only();

-- 3. create_event — re-paste of the current body (20260805000005); the ONLY
--    change is the Helper seed: "members":"read" instead of omitted.
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
  v_free_available boolean;
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

  -- Helper: full ops, no money, members:read (sees the roster, cannot act on
  -- it). Co-owner: full ops + full money + members:full (identity/access
  -- management — locked to this group by the trigger above).
  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'helper', 'Helper', 3, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"read","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_helper_id;

  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'admin', 'Co-owner', 2, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read",
    "budget":"full","gifts":"full"
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

-- Rollback: DROP TRIGGER event_access_groups_lock_members, DROP FUNCTION
-- enforce_members_admin_only, revert Helper groups' members back to omitted
-- (permissions - 'members'), re-paste create_event (20260805000005).
