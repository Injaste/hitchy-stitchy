-- Migration: point the public render at event_invitations (Step 3A).
-- =============================================================================
-- get_public_invitation has, until now, read the OLD event_invitation +
-- event_themes model (published_page.theme_slug from event_themes). Publishing in
-- the new admin editor therefore changed nothing a guest could see. Repoint it at
-- event_invitations: gate on published_at, render published_config, map
-- theme_slug = template_key (the registry key the public page already looks up).
--
-- Guardrails mirror the old render exactly:
--   * event must exist + not be soft-deleted        -> 'Invitation not found'
--   * is_event_active(event_id) must hold            -> 'Invitation not found'
--       (the canonical live/plan gate; soft-delete today, billing later — calling
--        it here means the public page inherits the gate when it grows teeth)
--   * a matching invitation row must exist + be published -> else 'Invitation not found'
-- The frontend treats the raised error as not-found (navigates home), same as before.
--
-- Behavioural change from the old model (intended): design + RSVP are now ONE
-- merged row, so an unpublished invitation has NO public presence at all (the old
-- split model could still show RSVP with no published theme). Unpublish -> not found.
--
-- Countdown date/time now live INSIDE the config JSON (20260615000009), projected
-- out of published_config to the top-level shape the frontend reads. event_time_end
-- was dropped.
--
-- Still one-per-event here (day_id/segment_id NULL). p_link_slug is accepted but
-- UNUSED until Step 3B wires per-link routing — declared now so 3B is a body-only
-- CREATE OR REPLACE (no signature churn). The frontend calls with p_slug only;
-- the DEFAULT keeps that working, and no frontend change is needed for 3A.
--
-- The OLD event_invitation / event_themes model stays live and untouched; it's
-- dropped only at go-live cleanup.
-- =============================================================================

-- Drop prior overloads so the 2-arg below is the SOLE get_public_invitation
-- (PostgREST can't disambiguate two overloads when the call passes one arg).
DROP FUNCTION IF EXISTS public.get_public_invitation(text);
DROP FUNCTION IF EXISTS public.get_public_invitation(text, text);

CREATE OR REPLACE FUNCTION public.get_public_invitation(
  p_slug      text,
  p_link_slug text DEFAULT null   -- unused until Step 3B (per-link routing)
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_event events;
  v_inv   event_invitations;
BEGIN
  SELECT * INTO v_event
  FROM events
  WHERE slug = p_slug AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  -- Live/plan gate (soft-delete today, billing later). Definer call — anon's
  -- direct EXECUTE on is_event_active is revoked, but this runs as the owner.
  IF NOT is_event_active(v_event.id) THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  -- One-per-event for now (day/segment NULL); must be published to be public.
  SELECT * INTO v_inv
  FROM event_invitations
  WHERE event_id = v_event.id
    AND day_id IS NULL
    AND segment_id IS NULL
    AND published_at IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  RETURN jsonb_build_object(
    'id',                   v_inv.id,
    'event_id',             v_inv.event_id,
    'event_date',           v_inv.published_config->>'event_date',
    'event_time_start',     v_inv.published_config->>'event_time_start',
    'event_time_end',       null,
    'rsvp_mode',            v_inv.rsvp_mode,
    'rsvp_deadline',        v_inv.rsvp_deadline,
    'max_guests',           v_inv.max_guests,
    'guest_count_min',      v_inv.guest_count_min,
    'guest_count_max',      v_inv.guest_count_max,
    'confirmation_message', v_inv.confirmation_message,
    'config',               v_inv.rsvp_config,
    'published_page', jsonb_build_object(
      'id',         v_inv.id,
      'theme_slug', v_inv.template_key,
      'config',     v_inv.published_config
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_invitation(text, text) TO anon, authenticated;

-- Rollback:
--   DROP FUNCTION IF EXISTS public.get_public_invitation(text, text);
--   (re-create the old event_themes-based get_public_invitation(text) from the DB dump)
