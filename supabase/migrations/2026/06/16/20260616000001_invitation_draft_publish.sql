-- Migration: draft/publish split for event_invitations (Step 2).
-- =============================================================================
-- Design content gets a draft -> published split:
--   event_invitations.field_config -> draft_config   (what the editor edits)
--   + add published_config jsonb                      (the promoted snapshot)
-- `published_at` already exists. RSVP settings stay live (no publish).
--
-- Publish copies draft_config -> published_config and stamps published_at.
-- Unpublish clears published_at (the public render gates on it -> page reads as
-- "not found"). delete_invitation already blocks published rows, so takedown is
-- unpublish -> delete.
--
-- Scope: NEW model only. event_templates.field_config (the template base config)
-- is NOT renamed — only the per-invitation column.
-- =============================================================================

-- 1. Rename the design column to draft_config (idempotent).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='event_invitations'
               AND column_name='field_config') THEN
    ALTER TABLE public.event_invitations RENAME COLUMN field_config TO draft_config;
  END IF;
END $$;

-- 2. Add the published snapshot (null = never published).
ALTER TABLE public.event_invitations
  ADD COLUMN IF NOT EXISTS published_config jsonb;

-- 3. create_invitation seeds draft_config from the template base config.
CREATE OR REPLACE FUNCTION public.create_invitation(
  p_event_id uuid, p_template_key text, p_name text DEFAULT 'My Invitation'
)
RETURNS event_invitations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller event_members;
  v_config jsonb;
  v_inv    event_invitations;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;
  IF NOT has_event_permission(p_event_id, 'invitation', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create an invitation';
  END IF;
  IF EXISTS (
    SELECT 1 FROM event_invitations
    WHERE event_id = p_event_id AND day_id IS NULL AND segment_id IS NULL
  ) THEN
    RAISE EXCEPTION 'An invitation already exists for this event';
  END IF;

  SELECT field_config INTO v_config
  FROM event_templates
  WHERE template_key = p_template_key AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;

  INSERT INTO event_invitations (event_id, template_key, name, draft_config)
  VALUES (
    p_event_id, p_template_key,
    COALESCE(NULLIF(btrim(p_name), ''), 'My Invitation'),
    COALESCE(v_config, '{}'::jsonb)
  )
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

-- 4. update_invitation writes draft_config (param renamed p_field_config ->
--    p_draft_config; drop the old 12-arg signature first).
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
  p_rsvp_config         jsonb
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
    rsvp_config          = COALESCE(p_rsvp_config, rsvp_config)
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

-- 5. publish_invitation — promote the current draft to the live page.
CREATE OR REPLACE FUNCTION public.publish_invitation(
  p_event_id uuid, p_id uuid
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
    RAISE EXCEPTION 'Insufficient permission to publish the invitation';
  END IF;

  UPDATE event_invitations
  SET published_config = draft_config,
      published_at     = now()
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

-- 6. unpublish_invitation — take the live page down (clears published_at).
CREATE OR REPLACE FUNCTION public.unpublish_invitation(
  p_event_id uuid, p_id uuid
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
    RAISE EXCEPTION 'Insufficient permission to unpublish the invitation';
  END IF;

  UPDATE event_invitations
  SET published_at = null
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

-- Rollback:
--   DROP FUNCTION IF EXISTS public.publish_invitation(uuid, uuid);
--   DROP FUNCTION IF EXISTS public.unpublish_invitation(uuid, uuid);
--   ALTER TABLE public.event_invitations DROP COLUMN IF EXISTS published_config;
--   ALTER TABLE public.event_invitations RENAME COLUMN draft_config TO field_config;
--   (and restore …0009's update_invitation / create_invitation bodies)
