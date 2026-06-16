-- Migration: fold publish into update_invitation (atomic one-RPC publish).
-- =============================================================================
-- Separate publish_invitation meant publishing was save-then-publish (two RPCs)
-- and, worse, the publish RPC ignored the draft passed to it — so publishing with
-- unsaved edits promoted the STALE db draft. Collapse it: update_invitation gains
-- p_to_publish; when true it writes the draft AND promotes it in the SAME UPDATE,
-- so the published snapshot is exactly what was just saved. Atomic, one call.
--
-- publish_invitation is dropped. unpublish_invitation stays (it just clears
-- published_at and never writes the draft).
-- =============================================================================

DROP FUNCTION IF EXISTS public.update_invitation(
  uuid, uuid, text, text, jsonb, event_rsvp_mode, timestamptz,
  integer, integer, integer, text, jsonb
);

CREATE OR REPLACE FUNCTION public.update_invitation(
  p_event_id            uuid,
  p_id                  uuid,
  p_template_key        text,
  p_name                text,
  p_draft_config        jsonb,
  p_rsvp_mode           event_rsvp_mode,
  p_rsvp_deadline       timestamptz,
  p_max_guests          integer,
  p_guest_count_min     integer,
  p_guest_count_max     integer,
  p_confirmation_message text,
  p_rsvp_config         jsonb,
  p_to_publish          boolean DEFAULT false
)
RETURNS event_invitations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller event_members;
  v_inv    event_invitations;
BEGIN
  SELECT * INTO v_inv FROM event_invitations WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_inv.event_id != p_event_id THEN
    RAISE EXCEPTION 'Invitation does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;
  IF NOT has_event_permission(p_event_id, 'invitation', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update the invitation';
  END IF;

  IF COALESCE(p_guest_count_max, v_inv.guest_count_max)
     < COALESCE(p_guest_count_min, v_inv.guest_count_min) THEN
    RAISE EXCEPTION 'Maximum guests cannot be less than the minimum';
  END IF;

  UPDATE event_invitations
  SET
    rsvp_deadline        = p_rsvp_deadline,
    max_guests           = p_max_guests,
    template_key         = COALESCE(p_template_key, template_key),
    name                 = COALESCE(NULLIF(btrim(p_name), ''), name),
    draft_config         = COALESCE(p_draft_config, draft_config),
    rsvp_mode            = COALESCE(p_rsvp_mode, rsvp_mode),
    guest_count_min      = COALESCE(p_guest_count_min, guest_count_min),
    guest_count_max      = COALESCE(p_guest_count_max, guest_count_max),
    confirmation_message = COALESCE(NULLIF(btrim(p_confirmation_message), ''), confirmation_message),
    rsvp_config          = COALESCE(p_rsvp_config, rsvp_config),
    -- Publish in the same statement: promote the just-written draft.
    published_config     = CASE WHEN p_to_publish
                                THEN COALESCE(p_draft_config, draft_config)
                                ELSE published_config END,
    published_at         = CASE WHEN p_to_publish THEN now() ELSE published_at END
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

-- No longer needed — publishing rides on update_invitation. Drop whichever
-- signature exists: the 2-arg from …0001, or the 12-arg atomic variant if the
-- (superseded) publish_atomic migration was run first.
DROP FUNCTION IF EXISTS public.publish_invitation(uuid, uuid);
-- Rollback:
--   DROP FUNCTION IF EXISTS public.update_invitation(
--     uuid,uuid,text,text,jsonb,event_rsvp_mode,timestamptz,integer,integer,integer,text,jsonb,boolean);
--   (re-run …0001's 12-arg update_invitation + publish_invitation)
