-- Migration: validate template_key in update_invitation against the catalog.
-- =============================================================================
-- create_invitation rejects an unknown/inactive template ('Template not found or
-- inactive'), but update_invitation did NOT — it set `template_key` to whatever
-- was passed, so a page could end up pointing at a template_key that has no
-- event_templates catalog row. (The public renderer still works because it maps
-- the key via the code registry, not the catalog — so the bad state was silent.)
--
-- Fix: when update_invitation is asked to CHANGE the template_key, require the new
-- key to be an active catalog row. The check is scoped to an actual change so it
-- can't break ordinary edits/saves of a page whose template was later deactivated
-- (those pass the unchanged key through and skip the check).
--
-- Same signature as 20260618000009 — CREATE OR REPLACE (no DROP); body is
-- reproduced verbatim with the one added guard. Live RPC change.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_invitation(
  p_event_id            uuid,
  p_id                  uuid,
  p_template_key        text,
  p_draft_config        jsonb,
  p_rsvp_mode           event_rsvp_mode,
  p_rsvp_deadline       timestamptz,
  p_max_guests          integer,
  p_guest_count_min     integer,
  p_guest_count_max     integer,
  p_confirmation_message text,
  p_rsvp_config         jsonb,
  p_private_code        text DEFAULT NULL,
  p_to_publish          boolean DEFAULT false
)
RETURNS event_invitations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_inv    event_invitations;
  v_mode   event_rsvp_mode;
  v_code   text;
BEGIN
  SELECT * INTO v_inv FROM event_invitations WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_inv.event_id != p_event_id THEN
    RAISE EXCEPTION 'Invitation does not belong to this event'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'invitation', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update the invitation'; END IF;

  -- Only validate when actually switching templates (unchanged key is a no-op,
  -- so existing pages on a since-deactivated template can still be edited).
  IF p_template_key IS NOT NULL AND p_template_key IS DISTINCT FROM v_inv.template_key THEN
    IF NOT EXISTS (
      SELECT 1 FROM event_templates WHERE template_key = p_template_key AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Template not found or inactive';
    END IF;
  END IF;

  IF COALESCE(p_guest_count_max, v_inv.guest_count_max)
     < COALESCE(p_guest_count_min, v_inv.guest_count_min) THEN
    RAISE EXCEPTION 'Maximum guests cannot be less than the minimum'; END IF;

  v_mode := COALESCE(p_rsvp_mode, v_inv.rsvp_mode);
  v_code := NULLIF(btrim(p_private_code), '');
  IF v_mode = 'private' AND v_code IS NULL THEN
    RAISE EXCEPTION 'A private code is required for private RSVP mode';
  END IF;

  UPDATE event_invitations SET
    template_key         = COALESCE(p_template_key, template_key),
    rsvp_deadline        = p_rsvp_deadline,
    max_guests           = p_max_guests,
    draft_config         = COALESCE(p_draft_config, draft_config),
    rsvp_mode            = COALESCE(p_rsvp_mode, rsvp_mode),
    guest_count_min      = COALESCE(p_guest_count_min, guest_count_min),
    guest_count_max      = COALESCE(p_guest_count_max, guest_count_max),
    confirmation_message = COALESCE(NULLIF(btrim(p_confirmation_message), ''), confirmation_message),
    rsvp_config          = COALESCE(p_rsvp_config, rsvp_config),
    private_code         = CASE WHEN v_mode = 'private' THEN v_code ELSE NULL END,
    published_config     = CASE WHEN p_to_publish THEN COALESCE(p_draft_config, draft_config) ELSE published_config END,
    published_at         = CASE WHEN p_to_publish THEN now() ELSE published_at END
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

-- Rollback: re-run the update_invitation body from 20260618000009 (without the
-- template_key catalog check).
