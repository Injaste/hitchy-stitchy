-- Migration: invitation CRUD RPCs (event_invitations).
-- =============================================================================
-- Step 1 of the invitation redesign. Writes to event_invitations go through these
-- SECURITY DEFINER RPCs (the table has a read RLS policy but no write policy, by
-- design). All gated on the `invitation` resource — design ops move off `themes`
-- (which lingers unused until cleanup). Built in parallel: the old create_theme/
-- update_theme/update_invitation(singular) stay live and untouched.
--
--   create_invitation  — new row for an event (pick a template). One-per-event in
--                        Step 1 (day_id/segment_id NULL); per-day in Step 3.
--   update_invitation  — WHOLE-invitation save (decision A): design + RSVP config
--                        in one call. NOT NULL fields COALESCE (keep on null);
--                        nullable fields direct-replace (so they can be cleared).
--                        15-arg OVERLOAD of the live update_invitation (11-arg on
--                        event_invitation); PostgREST resolves by the p_id /
--                        p_template_key args unique to this one. Old one dropped at cleanup.
--   delete_invitation  — remove an invitation (published rows are protected,
--                        matching delete_theme).
--
-- Pattern mirrors the guest RPCs: get_current_member -> active check ->
-- has_event_permission -> operate -> RETURN the row.
--
-- DEFERRED (land with the features that create the state — don't guard the
-- impossible now):
--   * delete_invitation: also block when the invitation has RSVPs (per-page RSVP
--     = Step 3). "Published row" already covers a live page.
--   * update_invitation: draft-vs-published editing buffer = Step 2.
--   * create_event still seeds the OLD event_invitation (guests read it) — drop
--     that INSERT at cleanup; new events stay explicit-create for event_invitations.
--   * event_invitations.day_id is ON DELETE CASCADE here (day_id always NULL in
--     Step 1). Switch to RESTRICT + a delete_day guard in settings at Step 3.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_invitation(
  p_event_id     uuid,
  p_template_key text,
  p_name         text DEFAULT 'My Invitation'
)
RETURNS event_invitations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller event_members;
  v_inv    event_invitations;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'invitation', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create an invitation';
  END IF;

  -- One invitation per event in Step 1 (day_id/segment_id NULL).
  IF EXISTS (
    SELECT 1 FROM event_invitations
    WHERE event_id = p_event_id AND day_id IS NULL AND segment_id IS NULL
  ) THEN
    RAISE EXCEPTION 'An invitation already exists for this event';
  END IF;

  INSERT INTO event_invitations (event_id, template_key, name)
  VALUES (p_event_id, p_template_key, COALESCE(NULLIF(btrim(p_name), ''), 'My Invitation'))
  RETURNING * INTO v_inv;

  RETURN v_inv;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_invitation(
  p_event_id            uuid,
  p_id                  uuid,
  p_template_key        text,
  p_name                text,
  p_theme_config        jsonb,
  p_event_date          date,
  p_event_time_start    text,
  p_event_time_end      text,
  p_rsvp_mode           event_rsvp_mode,
  p_rsvp_deadline       timestamptz,
  p_max_guests          integer,
  p_guest_count_min     integer,
  p_guest_count_max     integer,
  p_confirmation_message text,
  p_config              jsonb
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

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

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
    -- nullable fields: direct-replace (allows clearing)
    event_date           = p_event_date,
    event_time_start     = p_event_time_start,
    event_time_end       = p_event_time_end,
    rsvp_deadline        = p_rsvp_deadline,
    max_guests           = p_max_guests,
    -- NOT NULL fields: keep current value when null is passed
    template_key         = COALESCE(p_template_key, template_key),
    name                 = COALESCE(NULLIF(btrim(p_name), ''), name),
    theme_config         = COALESCE(p_theme_config, theme_config),
    rsvp_mode            = COALESCE(p_rsvp_mode, rsvp_mode),
    guest_count_min      = COALESCE(p_guest_count_min, guest_count_min),
    guest_count_max      = COALESCE(p_guest_count_max, guest_count_max),
    confirmation_message = COALESCE(NULLIF(btrim(p_confirmation_message), ''), confirmation_message),
    config               = COALESCE(p_config, config)
  WHERE id = p_id
  RETURNING * INTO v_inv;

  RETURN v_inv;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_invitation(
  p_event_id uuid,
  p_id       uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller event_members;
  v_inv    event_invitations;
BEGIN
  SELECT * INTO v_inv FROM event_invitations WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF v_inv.event_id != p_event_id THEN
    RAISE EXCEPTION 'Invitation does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'invitation', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to delete the invitation';
  END IF;

  IF v_inv.published_at IS NOT NULL THEN
    RAISE EXCEPTION 'Published invitation cannot be deleted';
  END IF;

  DELETE FROM event_invitations WHERE id = p_id;
END;
$$;

-- Rollback:
--   DROP FUNCTION public.create_invitation(uuid, text, text);
--   DROP FUNCTION public.update_invitation(uuid, uuid, text, text, jsonb, date, text, text, event_rsvp_mode, timestamptz, integer, integer, integer, text, jsonb);
--   DROP FUNCTION public.delete_invitation(uuid, uuid);
