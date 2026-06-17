-- HOTFIX (production restore): put get_public_invitation back to the OLD model.
-- =============================================================================
-- 3A (20260617000001) repointed this SHARED, production-facing function onto the
-- new event_invitations model. Production events live in the OLD model
-- (event_invitation + event_themes) and have no new-model row, so the live page
-- returned 'Invitation not found' — an outage. This restores the original
-- old-model body verbatim (the new model gets its own additive path later, NOT by
-- mutating this function).
--
-- CREATE OR REPLACE only (no DROP): keeps the current (text, text) signature so
-- the deployed frontend's get_public_invitation(p_slug) keeps resolving;
-- p_link_slug is ignored. Body is the pre-3A definition (jsonb_build_object instead
-- of json_build_object only because the current return type is jsonb — behaviourally
-- identical to the frontend).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_public_invitation(p_slug text, p_link_slug text DEFAULT null)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_event      events;
  v_invitation event_invitation;
  v_theme      event_themes;
BEGIN
  SELECT * INTO v_event
  FROM events
  WHERE slug = p_slug AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF NOT is_event_active(v_event.id) THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  SELECT * INTO v_invitation
  FROM event_invitation
  WHERE event_id = v_event.id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  SELECT * INTO v_theme
  FROM event_themes
  WHERE event_id = v_event.id AND published_at IS NOT NULL
  LIMIT 1;

  RETURN jsonb_build_object(
    'id',                   v_invitation.id,
    'event_id',             v_invitation.event_id,
    'event_date',           v_invitation.event_date,
    'event_time_start',     v_invitation.event_time_start,
    'event_time_end',       v_invitation.event_time_end,
    'rsvp_mode',            v_invitation.rsvp_mode,
    'rsvp_deadline',        v_invitation.rsvp_deadline,
    'max_guests',           v_invitation.max_guests,
    'guest_count_min',      v_invitation.guest_count_min,
    'guest_count_max',      v_invitation.guest_count_max,
    'confirmation_message', v_invitation.confirmation_message,
    'config',               v_invitation.config,
    'published_page', CASE
      WHEN v_theme.id IS NOT NULL THEN jsonb_build_object(
        'id',         v_theme.id,
        'theme_slug', v_theme.config->>'slug',
        'config',     v_theme.config
      )
      ELSE NULL
    END
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_invitation(text, text) TO anon, authenticated;
