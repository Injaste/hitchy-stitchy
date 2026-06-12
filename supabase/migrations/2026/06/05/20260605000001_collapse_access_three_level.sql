-- Migration: collapse access to a fixed 3-level model (none/read/full)
--
-- Replaces the dynamic per-action permission matrix with two seeded, read-only
-- access groups (Admin, Team). SuperAdmin (couple/owner) stays flag-derived via
-- is_super_admin() and bypasses everything — there is no longer a SuperAdmin
-- *group* (it was an empty-perm home the flag never reads).
--
--   permissions jsonb shape:  { "<resource>": "none" | "read" | "full" }
--   - read  action  -> level IN ('read','full')
--   - write actions -> level = 'full'
--
-- Member management (delete / freeze / change-group) is gated by a CAPABILITY
-- rank: superadmin > members:full > everyone else. You may act on a member only
-- if you outrank them; couple/owner (rank 0) are unreachable.
--
-- Resources after this migration: timeline, tasks, guests, invitation, themes,
-- members, access. (vendors / announcements / tasks.archive / members.freeze /
-- pages / events are dropped from the catalog.)
--
-- Supersedes the never-applied 20260604000003_superadmin_only_member_mgmt.sql.

-- =============================================================================
-- 1) Permission chokepoint — 3-level semantics
-- =============================================================================
CREATE OR REPLACE FUNCTION public.has_event_permission(p_event_id uuid, p_resource text, p_action text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_level  text;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RETURN false; END IF;

  -- Couple/owner bypass everything (flag-derived).
  IF is_super_admin(v_caller) THEN RETURN true; END IF;

  SELECT ag.permissions ->> p_resource INTO v_level
  FROM event_access_groups ag
  WHERE ag.id = v_caller.access_group_id;

  IF v_level IS NULL THEN RETURN false; END IF;

  IF p_action = 'read' THEN
    RETURN v_level IN ('read', 'full');
  END IF;
  -- create / update / delete -> requires full
  RETURN v_level = 'full';
END;
$$;

-- =============================================================================
-- 2) Redefine get_member_rank as a CAPABILITY rank for the peer rule.
--    Was couple-identity only (root=0, couple=1, else=2) — which couldn't tell an
--    Admin (members:full) from a Team member, so an Admin could never outrank one.
--    Now: 0 = superadmin, 1 = members:full, 2 = everyone else. Lower = higher rank;
--    caller may act on target iff rank(caller) < rank(target). Couple protection is
--    handled separately by the is_super_admin(target) guard in each RPC.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_member_rank(p_member event_members)
RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN is_super_admin(p_member) THEN 0
    WHEN (
      SELECT (ag.permissions ->> 'members') = 'full'
      FROM event_access_groups ag
      WHERE ag.id = p_member.access_group_id
    ) THEN 1
    ELSE 2
  END;
$$;

-- =============================================================================
-- 3) freeze_member — repoint the dropped `members.freeze` resource to `members`.
--    delete_member / update_member_access_group need NO change: redefining
--    get_member_rank above updates their existing rank check in place, and they
--    already gate on has_event_permission('members', ...).
-- =============================================================================

-- freeze_member  (folds members.freeze -> members)
CREATE OR REPLACE FUNCTION public.freeze_member(p_event_id uuid, p_id uuid, p_freeze boolean)
RETURNS event_members LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_target event_members;
  v_caller event_members;
  v_member event_members;
BEGIN
  SELECT * INTO v_target FROM event_members WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;

  IF is_super_admin(v_target) THEN
    RAISE EXCEPTION 'This member cannot be frozen';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'members', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to freeze members';
  END IF;

  IF v_caller.id = p_id THEN
    RAISE EXCEPTION 'You cannot freeze yourself';
  END IF;

  IF get_member_rank(v_caller) >= get_member_rank(v_target) THEN
    RAISE EXCEPTION 'You do not have sufficient rank to freeze this member';
  END IF;

  UPDATE event_members
  SET frozen_at = CASE WHEN p_freeze THEN now() ELSE NULL END
  WHERE id = p_id
  RETURNING * INTO v_member;

  RETURN v_member;
END;
$$;

-- update_member_couple  (demotion -> Team group; flag handles promotion)
CREATE OR REPLACE FUNCTION public.update_member_couple(p_event_id uuid, p_id uuid, p_is_bride boolean DEFAULT NULL::boolean, p_is_groom boolean DEFAULT NULL::boolean)
RETURNS event_members LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_target  event_members;
  v_caller  event_members;
  v_member  event_members;
  v_team_id uuid;
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

  IF p_is_bride = true AND v_target.is_bride = false THEN
    IF EXISTS (SELECT 1 FROM event_members WHERE event_id = p_event_id AND is_bride = true AND id != p_id) THEN
      RAISE EXCEPTION 'This event already has a bride';
    END IF;
  END IF;

  IF p_is_groom = true AND v_target.is_groom = false THEN
    IF EXISTS (SELECT 1 FROM event_members WHERE event_id = p_event_id AND is_groom = true AND id != p_id) THEN
      RAISE EXCEPTION 'This event already has a groom';
    END IF;
  END IF;

  UPDATE event_members
  SET is_bride = COALESCE(p_is_bride, is_bride),
      is_groom = COALESCE(p_is_groom, is_groom)
  WHERE id = p_id
  RETURNING * INTO v_member;

  -- No longer couple/owner -> drop to the Team group (flag granted the power,
  -- so removing it must drop them to a real, limited group).
  IF NOT is_super_admin(v_member) THEN
    SELECT id INTO v_team_id
    FROM event_access_groups
    WHERE event_id = p_event_id AND name = 'Team';

    IF v_team_id IS NOT NULL THEN
      UPDATE event_members
      SET access_group_id = v_team_id
      WHERE id = p_id
      RETURNING * INTO v_member;
    END IF;
  END IF;

  RETURN v_member;
END;
$$;

-- archive_tasks — archiving folds into tasks:full (tasks.archive resource dropped)
CREATE OR REPLACE FUNCTION public.archive_tasks(p_event_id uuid, p_ids uuid[], p_archive boolean)
RETURNS SETOF event_tasks LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_task   event_tasks;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  FOR v_task IN
    SELECT * FROM event_tasks
    WHERE id = ANY(p_ids) AND event_id = p_event_id
  LOOP
    IF NOT has_event_permission(p_event_id, 'tasks', 'update') THEN
      IF v_task.created_by IS DISTINCT FROM v_caller.id THEN
        RAISE EXCEPTION 'Insufficient permission to archive task "%"', v_task.title;
      END IF;
    END IF;

    IF p_archive THEN
      UPDATE event_settings
      SET task_order = jsonb_set(
        task_order,
        ARRAY[v_task.status::text],
        COALESCE(
          (SELECT jsonb_agg(x)
           FROM jsonb_array_elements_text(task_order -> v_task.status::text) x
           WHERE x != v_task.id::text),
          '[]'
        )
      )
      WHERE event_id = p_event_id;
    ELSE
      UPDATE event_settings
      SET task_order = jsonb_set(
        task_order,
        ARRAY[v_task.status::text],
        (task_order -> v_task.status::text) || to_jsonb(v_task.id::text)
      )
      WHERE event_id = p_event_id;
    END IF;

    UPDATE event_tasks
    SET archived_at = CASE WHEN p_archive THEN now() ELSE NULL END
    WHERE id = v_task.id
    RETURNING * INTO v_task;

    RETURN NEXT v_task;
  END LOOP;
END;
$$;

-- =============================================================================
-- 4) create_event — seed Admin + Team only; owner homed in Admin
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_event(p_slug text, p_name text, p_date_start date, p_date_end date, p_display_name text)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_email     text := auth.jwt() ->> 'email';
  v_event_id  uuid;
  v_slug      text;
  v_admin_id  uuid;
  v_team_id   uuid;
  v_member_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  INSERT INTO events (slug, name, date_start, date_end)
  VALUES (p_slug, p_name, p_date_start, p_date_end)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "themes":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"full","guests":"read","invitation":"read",
    "themes":"read","members":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

  INSERT INTO event_members (
    event_id, user_id, email, display_name, access_group_id,
    is_root, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, v_email, p_display_name, v_admin_id,
    true, now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_invitation (event_id) VALUES (v_event_id);
  INSERT INTO event_settings (event_id) VALUES (v_event_id);

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, p_date_start, p_date_end, false;
END;
$$;

-- =============================================================================
-- 5) Drop the dynamic access-group editor RPCs (groups are now fixed)
-- =============================================================================
DROP FUNCTION IF EXISTS public.create_access_group(uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.update_access_group(uuid, uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.delete_access_group(uuid, uuid);

-- =============================================================================
-- 6) event_resources is just the catalog of what features exist. The capability
--    columns were dead metadata (perms live per-group in jsonb) — drop them and
--    reseed the resource list.
-- =============================================================================
ALTER TABLE public.event_resources DROP COLUMN IF EXISTS can_create;
ALTER TABLE public.event_resources DROP COLUMN IF EXISTS can_read;
ALTER TABLE public.event_resources DROP COLUMN IF EXISTS can_update;
ALTER TABLE public.event_resources DROP COLUMN IF EXISTS can_delete;

DELETE FROM public.event_resources;
INSERT INTO public.event_resources (resource) VALUES
  ('timeline'), ('tasks'), ('guests'), ('invitation'), ('themes'), ('members'), ('access');

-- =============================================================================
-- 7) Migrate existing data to the fixed Admin + Team model
-- =============================================================================

-- Canonical perms on the existing Admin group.
UPDATE public.event_access_groups
SET permissions = '{
  "timeline":"full","tasks":"full","guests":"full","invitation":"full",
  "themes":"full","members":"full","access":"read"
}'::jsonb
WHERE name = 'Admin';

-- Rename the old "General" group to "Team" with canonical perms.
UPDATE public.event_access_groups
SET name = 'Team',
    permissions = '{
      "timeline":"full","tasks":"full","guests":"read","invitation":"read",
      "themes":"read","members":"read"
    }'::jsonb
WHERE name = 'General';

-- Guarantee both groups exist for every event (idempotent).
INSERT INTO public.event_access_groups (event_id, name, permissions)
SELECT e.id, 'Admin', '{
  "timeline":"full","tasks":"full","guests":"full","invitation":"full",
  "themes":"full","members":"full","access":"read"
}'::jsonb
FROM public.events e
WHERE NOT EXISTS (SELECT 1 FROM event_access_groups g WHERE g.event_id = e.id AND g.name = 'Admin');

INSERT INTO public.event_access_groups (event_id, name, permissions)
SELECT e.id, 'Team', '{
  "timeline":"full","tasks":"full","guests":"read","invitation":"read",
  "themes":"read","members":"read"
}'::jsonb
FROM public.events e
WHERE NOT EXISTS (SELECT 1 FROM event_access_groups g WHERE g.event_id = e.id AND g.name = 'Team');

-- Couple/owner currently live in the SuperAdmin group -> home them in Admin.
UPDATE public.event_members m
SET access_group_id = (
  SELECT g.id FROM event_access_groups g WHERE g.event_id = m.event_id AND g.name = 'Admin'
)
WHERE m.access_group_id IN (SELECT id FROM event_access_groups WHERE name = 'SuperAdmin');

-- Any remaining members in non-canonical groups -> Team (safe default).
UPDATE public.event_members m
SET access_group_id = (
  SELECT g.id FROM event_access_groups g WHERE g.event_id = m.event_id AND g.name = 'Team'
)
WHERE m.access_group_id IN (SELECT id FROM event_access_groups WHERE name NOT IN ('Admin', 'Team'));

-- Scrub dropped group ids out of timeline assignees before deleting the groups.
UPDATE public.event_timelines t
SET assignees = array_remove(t.assignees, g.id)
FROM public.event_access_groups g
WHERE g.name NOT IN ('Admin', 'Team') AND g.id = ANY(t.assignees);

-- Drop SuperAdmin + any leftover custom groups. Only Admin + Team remain.
DELETE FROM public.event_access_groups WHERE name NOT IN ('Admin', 'Team');
