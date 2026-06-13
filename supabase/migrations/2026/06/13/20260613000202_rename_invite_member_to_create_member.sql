-- Rename invite_member → create_member and let it optionally assign a couple role
-- in one shot, so the couple can be added at creation instead of create → edit.
--
-- create_member only creates a (pending) member row — the invite_token still
-- auto-generates via column default — and its own permission check already gates
-- on ('members','create'), so the name now matches both behaviour and the
-- create-member modal/schema on the client.
--
-- Couple assignment is delegated to update_member_couple (super-admin permission +
-- one-bride / one-groom-per-event rule); running in the same transaction means a
-- rejected couple step rolls the member insert back too — atomic.
--
-- update_member_couple itself moves from two booleans to a single p_couple enum
-- ('bride' | 'groom' | null), matching how every caller already uses it (a single
-- mutually-exclusive role; the partial-update via NULL was never used). Defined
-- before create_member so the delegated call resolves the new signature.
--
-- The invite-link flow (regenerate_member_invite) keeps the "invite" name.

DROP FUNCTION IF EXISTS public.invite_member(uuid, text, uuid, text, text);

DROP FUNCTION IF EXISTS public.update_member_couple(uuid, uuid, boolean, boolean);

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
  v_team_id  uuid;
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
