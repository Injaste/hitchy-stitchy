-- Per-event invite-message override (MVP Phase 1 follow-up, tier 2 —
-- docs/todo/mvp-phase-1-member-invite.md).
--
-- Tier 1 shipped the share text as a code template (INVITE_MESSAGE) with
-- {{member}}/{{event}} placeholders. This stores a per-event override on
-- event_settings so managers can personalise it. NULL = fall back to the code
-- default; the frontend renders the placeholders and appends the join link.
--
-- Read is the plain event_settings SELECT policy (all members). Write is a
-- manager-gated RPC (members:update — the same people who invite/regenerate),
-- NOT a direct table write: event_settings has no UPDATE policy, and gating in a
-- SECURITY DEFINER function keeps the permission check server-side. Run order:
-- after 20260713000001_clear_expired_invite_tokens.sql (same day, next feature).

ALTER TABLE public.event_settings
  ADD COLUMN IF NOT EXISTS invite_message text;

-- update_invite_message — NEW: manager-gated write of the per-event invite
-- template. Trims + caps at 500 chars; a blank message collapses to NULL (reset to
-- the code default). {link} is mandatory ({member}/{event} optional) so the join
-- link always has a home — mirrors validateInviteMessage on the client. Returns
-- the stored value so the client reconciles its cache.
CREATE OR REPLACE FUNCTION public.update_invite_message(p_event_id uuid, p_message text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_clean  text;
  v_result text;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'members', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to edit the invite message';
  END IF;

  -- Blank -> NULL (use the code default); otherwise trim and cap length.
  v_clean := NULLIF(left(btrim(p_message), 500), '');

  -- {link} is mandatory when a custom message is set (NULL falls back to the
  -- default, which contains {link}). {member}/{event} stay optional.
  -- Case-insensitive (~*), matching the client's validateInviteMessage.
  IF v_clean IS NOT NULL AND v_clean !~* '\{link\}' THEN
    RAISE EXCEPTION 'Invite message must include {link}';
  END IF;

  UPDATE public.event_settings
  SET invite_message = v_clean
  WHERE event_id = p_event_id
  RETURNING invite_message INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event settings not found';
  END IF;

  RETURN v_result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.update_invite_message(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.update_invite_message(uuid, text) TO authenticated;

-- Rollback:
-- DROP FUNCTION IF EXISTS public.update_invite_message(uuid, text);
-- ALTER TABLE public.event_settings DROP COLUMN IF EXISTS invite_message;
