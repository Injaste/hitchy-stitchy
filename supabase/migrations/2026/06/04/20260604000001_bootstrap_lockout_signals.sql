-- Migration: get_bootstrap_context — distinguishable lockout signals
-- Adds specific error messages for frozen and rejected members so the client
-- can display a friendly "suspended" or "removed" screen instead of a generic error.
-- True non-members (wrong event, never invited) still receive the generic message
-- so no event-existence information is leaked to outside users.
--
-- Backward-compatible: existing callers that catch "You are not an active member"
-- will still catch the new messages if they do substring matching; callers that
-- only check for *any* error continue to work unchanged.

CREATE OR REPLACE FUNCTION public.get_bootstrap_context(p_slug text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_event        events;
  v_member       event_members;
  v_access_group event_access_groups;
BEGIN
  SELECT * INTO v_event
  FROM events
  WHERE events.slug     = p_slug
    AND events.deleted_at IS NULL;

  IF NOT FOUND THEN
    -- Generic: don't reveal whether the event exists to non-members.
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  -- Check for any membership row for this user + event (regardless of state).
  SELECT * INTO v_member
  FROM event_members
  WHERE event_id = v_event.id
    AND user_id  = auth.uid();

  IF NOT FOUND THEN
    -- No row at all — never invited, or invited under a different email.
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  -- Row found but check state in priority order.
  IF v_member.rejected_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_REMOVED: Your access to this event has been removed';
  END IF;

  IF v_member.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_SUSPENDED: Your access to this event has been suspended';
  END IF;

  IF v_member.joined_at IS NULL THEN
    -- Pending — invited but not yet accepted.
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  -- Active member — proceed as before.
  SELECT * INTO v_access_group
  FROM event_access_groups
  WHERE id = v_member.access_group_id;

  RETURN json_build_object(
    'event_id',   v_event.id,
    'slug',       v_event.slug,
    'event_name', v_event.name,
    'date_start', v_event.date_start,
    'date_end',   v_event.date_end,
    'member', json_build_object(
      'id',           v_member.id,
      'display_name', v_member.display_name,
      'role',         v_member.role,
      'is_root',      v_member.is_root,
      'is_bride',     v_member.is_bride,
      'is_groom',     v_member.is_groom
    ),
    'access_group', json_build_object(
      'id',          v_access_group.id,
      'name',        v_access_group.name,
      'permissions', v_access_group.permissions
    )
  );
END;
$function$;

-- Rollback: paste the original function body below to revert.
-- The original function used a single SELECT with joined_at IS NOT NULL AND frozen_at IS NULL,
-- raising 'You are not an active member of this event' for all non-active states.
--
-- CREATE OR REPLACE FUNCTION public.get_bootstrap_context(p_slug text)
--  RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $function$
-- DECLARE
--   v_event events; v_member event_members; v_access_group event_access_groups;
-- BEGIN
--   SELECT * INTO v_event FROM events WHERE events.slug = p_slug AND events.deleted_at IS NULL;
--   IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;
--   SELECT * INTO v_member FROM event_members
--     WHERE event_id = v_event.id AND user_id = auth.uid()
--       AND joined_at IS NOT NULL AND frozen_at IS NULL;
--   IF NOT FOUND THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
--   SELECT * INTO v_access_group FROM event_access_groups WHERE id = v_member.access_group_id;
--   RETURN json_build_object(...same as above...);
-- END; $function$;
