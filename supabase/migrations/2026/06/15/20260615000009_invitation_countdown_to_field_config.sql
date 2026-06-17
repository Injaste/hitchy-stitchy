-- Migration: move the countdown date/time into field_config (content).
-- =============================================================================
-- event_date / event_time_start only ever drove the template's hero countdown —
-- they're content, not structured invitation data, and don't belong as columns
-- lumped into the RSVP form. Fold them into field_config (where the template now
-- reads them as a "Countdown" schema group) and drop the columns. event_time_end
-- was never used anywhere; dropped too.
--
-- Scope: NEW model only (event_invitations). The OLD event_invitation (singular)
-- keeps its columns — guests + the live page still read them until go-live.
-- =============================================================================

-- 1. Preserve existing values: copy the columns into field_config before dropping.
UPDATE public.event_invitations
SET field_config = COALESCE(field_config, '{}'::jsonb)
  || jsonb_build_object(
       'event_date', to_char(event_date, 'YYYY-MM-DD'),
       'event_time_start', event_time_start
     );

-- 2. Seed the template base config so new invitations carry the countdown keys
--    (dannad reference: 4 Jul 2026, 10:00).
UPDATE public.event_templates
SET field_config = field_config
  || '{"event_date": "2026-07-04", "event_time_start": "10:00"}'::jsonb
WHERE template_key = 'unique-muslim';

-- 3. Recreate update_invitation without the dropped countdown params (the date now
--    rides inside p_field_config). Drop the 15-arg overload first.
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

-- 4. Drop the now-unused columns.
ALTER TABLE public.event_invitations
  DROP COLUMN IF EXISTS event_date,
  DROP COLUMN IF EXISTS event_time_start,
  DROP COLUMN IF EXISTS event_time_end;

-- Rollback:
--   ALTER TABLE public.event_invitations
--     ADD COLUMN event_date date,
--     ADD COLUMN event_time_start text,
--     ADD COLUMN event_time_end text;
--   (re-run …0008's update_invitation to restore the 15-arg signature, and
--    backfill the columns from field_config if needed)
