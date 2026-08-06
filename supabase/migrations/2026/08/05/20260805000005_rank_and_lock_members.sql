-- Migration: rank-aware get_member_rank + lock 'members' to admin-tier only
-- =============================================================================
-- Two changes, one migration:
--
-- 1. get_member_rank now reads event_access_groups.rank instead of inferring
--    rank from "does my group have members:full". That inference tied Helper
--    and Co-owner at rank 1 (both had members:full), so neither could manage
--    the other via update_member_access_group / delete_member / freeze_member
--    (all three already delegate to get_member_rank with a
--    `get_member_rank(caller) >= get_member_rank(target) -> blocked` check —
--    confirmed against their LIVE bodies, not the repo, which had drifted).
--    Reading the rank column directly gives Owner(0) > Co-owner(2) > Helper(3),
--    and needs no changes to those three RPCs — they inherit the fix for free.
--    create_member (invite) never calls get_member_rank, so it's unaffected.
--
-- 2. 'members' is removed from Helper's grant. Identity/access management
--    (invite, edit-others, freeze, remove, reassign group) is the escalation
--    surface for this whole system (the IAM parallel: iam:AttachUserPolicy-
--    style actions are conventionally restricted to a narrow admin tier, never
--    bundled into ordinary resource CRUD). Only Owner (bypass) and Co-owner
--    keep it. Roster VISIBILITY is unaffected — get_members shows the roster to
--    every active member regardless of the 'members' permission (only audit
--    fields are manager-gated), and self-edit (update_member editing your own
--    row) has no permission check at all. What Helper loses is the ability to
--    invite, edit OTHERS, freeze, remove, or reassign anyone else's group.
--
-- This is a real behaviour change from the current live default (every
-- existing "Admin"-turned-"Helper" member could invite/manage others) — flagged
-- and confirmed, not incidental.
--
-- NOTE for whoever rebuilds the Access page / group-CRUD later: 'members'
-- should NOT be offered as a togglable resource on a custom group. It's tied to
-- being Owner/Co-owner tier, not an independently grantable permission — there
-- is currently no mechanism that could violate this (create/update/delete_
-- access_group were dropped in 20260605000001, so no group's permissions can be
-- edited at all today), but it stops being true automatically once group-CRUD
-- returns, so build that constraint in at that point.
-- =============================================================================

-- 1. get_member_rank — rank-column-aware.
CREATE OR REPLACE FUNCTION public.get_member_rank(p_member event_members)
RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN is_super_admin(p_member) THEN 0
    ELSE COALESCE(
      (SELECT ag.rank FROM event_access_groups ag WHERE ag.id = p_member.access_group_id),
      999
    )
  END;
$$;

-- 2. Strip 'members' from existing Helper groups.
UPDATE event_access_groups
SET permissions = permissions - 'members'
WHERE code = 'helper';

-- 3. create_event — re-paste of the current body (20260805000004); the ONLY
--    change is dropping "members":"full" from the Helper seed.
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

  -- Helper: full ops, no money, NO member-management (identity/access is
  -- Owner+Co-owner only). Co-owner: full ops + full money + member-management.
  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'helper', 'Helper', 3, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","access":"read"
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

-- Rollback: re-add "members":"full" to Helper groups (UPDATE ... SET
-- permissions = permissions || '{"members":"full"}'), re-paste get_member_rank
-- (the is_root/is_bride/is_groom body — note: that pre-migration body was
-- itself already stale vs. the live DB, which used the members-permission
-- heuristic; restore THAT one if truly rolling back) and create_event
-- (20260805000004).
