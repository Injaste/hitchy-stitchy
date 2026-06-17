-- Migration: rename config columns for clarity (field_config / rsvp_config).
-- =============================================================================
-- "config" is too vague. Rename:
--   event_templates.config      -> field_config   (the template's design fields)
--   event_invitations.theme_config -> field_config (this invitation's design fields)
--   event_invitations.config    -> rsvp_config    (the RSVP settings blob)
-- RENAME preserves data, defaults, and NOT NULL. The OLD event_invitation
-- (singular) and event_themes "config" columns are left as-is (guests + the live
-- page still read them). RPCs that reference the renamed columns are updated:
--   create_invitation, update_invitation (params p_theme_config/p_config ->
--   p_field_config/p_rsvp_config), and the dormant create_theme (reads templates).
-- =============================================================================

-- Idempotent renames (re-runnable: the previous attempt may have applied some).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='event_templates' AND column_name='config') THEN
    ALTER TABLE public.event_templates RENAME COLUMN config TO field_config;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='event_invitations' AND column_name='theme_config') THEN
    ALTER TABLE public.event_invitations RENAME COLUMN theme_config TO field_config;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='event_invitations' AND column_name='config') THEN
    ALTER TABLE public.event_invitations RENAME COLUMN config TO rsvp_config;
  END IF;
END $$;

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

  INSERT INTO event_invitations (event_id, template_key, name, field_config)
  VALUES (
    p_event_id, p_template_key,
    COALESCE(NULLIF(btrim(p_name), ''), 'My Invitation'),
    COALESCE(v_config, '{}'::jsonb)
  )
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;

-- Renaming params requires a drop first (CREATE OR REPLACE can't rename inputs).
-- Targets the 15-arg overload only (the old p_theme_config/p_config version);
-- the 11-arg update_invitation on event_invitation is a different signature.
DROP FUNCTION IF EXISTS public.update_invitation(
  uuid, uuid, text, text, jsonb, date, text, text, event_rsvp_mode,
  timestamptz, integer, integer, integer, text, jsonb
);

CREATE OR REPLACE FUNCTION public.update_invitation(
  p_event_id            uuid,
  p_id                  uuid,
  p_template_key        text,
  p_name                text,
  p_field_config        jsonb,
  p_event_date          date,
  p_event_time_start    text,
  p_event_time_end      text,
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
    event_date           = p_event_date,
    event_time_start     = p_event_time_start,
    event_time_end       = p_event_time_end,
    rsvp_deadline        = p_rsvp_deadline,
    max_guests           = p_max_guests,
    template_key         = COALESCE(p_template_key, template_key),
    name                 = COALESCE(NULLIF(btrim(p_name), ''), name),
    field_config         = COALESCE(p_field_config, field_config),
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

-- Dormant old RPC — keep it valid against the renamed templates column.
CREATE OR REPLACE FUNCTION public.create_theme(
  p_event_id uuid, p_template_id uuid, p_name text DEFAULT 'My Invitation'
)
RETURNS event_themes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller event_members;
  v_config jsonb;
  v_theme  event_themes;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;
  IF NOT has_event_permission(p_event_id, 'themes', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create themes';
  END IF;
  SELECT field_config INTO v_config
  FROM event_templates
  WHERE id = p_template_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  INSERT INTO event_themes (event_id, template_id, name, config)
  VALUES (p_event_id, p_template_id, p_name, v_config)
  RETURNING * INTO v_theme;
  RETURN v_theme;
END;
$$;

-- Rollback:
--   ALTER TABLE public.event_templates   RENAME COLUMN field_config TO config;
--   ALTER TABLE public.event_invitations RENAME COLUMN field_config TO theme_config;
--   ALTER TABLE public.event_invitations RENAME COLUMN rsvp_config  TO config;
--   (and restore the prior RPC bodies / param names)
