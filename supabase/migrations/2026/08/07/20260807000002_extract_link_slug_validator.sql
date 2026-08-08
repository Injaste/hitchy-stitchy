-- Migration: extract the invitation link-path validator into one helper
-- =============================================================================
-- 20260807000001 added set_invitation_link_slug by COPYING create_invitation's
-- link-path validation block verbatim (format regex + reserved-slug check +
-- per-event uniqueness). Two copies of one rule is exactly the drift the
-- codebase avoids elsewhere with shared helpers (assert_event_writable,
-- assert_plan, is_slug_taken). Collapse them into one.
--
-- validate_invitation_link_slug(p_event_id, p_link_slug, p_exclude_id):
--   • Returns the NORMALISED slug (lower/btrim, '' -> NULL), so callers stop
--     hand-rolling `NULLIF(btrim(lower(...)), '')` too.
--   • NULL result = the event root; enforces at most one root per event.
--   • p_exclude_id lets an UPDATE skip its own row (a create passes NULL).
--     This is the only behavioural difference between the two former copies.
--
-- Both callers are re-pastes of their confirmed-live bodies; the only change in
-- each is swapping the inline block for the helper call. No signature changes,
-- no behaviour change for create_invitation.
-- One transaction.
-- =============================================================================

BEGIN;

-- 1) The shared validator. -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_invitation_link_slug(
  p_event_id   uuid,
  p_link_slug  text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_slug text := NULLIF(btrim(lower(p_link_slug)), '');
BEGIN
  IF v_slug IS NULL THEN
    -- Root (no path). At most one per event; NULLS NOT DISTINCT on
    -- event_invitations_event_link_slug_key is the hard backstop.
    IF EXISTS (
      SELECT 1 FROM event_invitations
      WHERE event_id = p_event_id
        AND link_slug IS NULL
        AND (p_exclude_id IS NULL OR id <> p_exclude_id)
    ) THEN
      RAISE EXCEPTION 'A root link already exists — choose a link path';
    END IF;
    RETURN NULL;
  END IF;

  IF v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Link path may use only lowercase letters, numbers and hyphens';
  END IF;

  -- Permanent slug_reservations entry (system/route names) — see
  -- docs/architecture/reserved-slugs.md.
  IF EXISTS (SELECT 1 FROM slug_reservations WHERE slug = v_slug AND expires_at IS NULL) THEN
    RAISE EXCEPTION 'That link path is reserved';
  END IF;

  IF EXISTS (
    SELECT 1 FROM event_invitations
    WHERE event_id = p_event_id
      AND link_slug = v_slug
      AND (p_exclude_id IS NULL OR id <> p_exclude_id)
  ) THEN
    RAISE EXCEPTION 'That link path is already in use';
  END IF;

  RETURN v_slug;
END;
$$;
-- Internal helper: called only from SECURITY DEFINER RPCs that already
-- authorise the caller. Not part of the client surface.
REVOKE EXECUTE ON FUNCTION public.validate_invitation_link_slug(uuid, text, uuid)
  FROM PUBLIC, anon, authenticated;

-- 2) create_invitation — re-paste of 20260618000106, inline block -> helper. ---
CREATE OR REPLACE FUNCTION public.create_invitation(
  p_event_id uuid, p_template_key text, p_day_id uuid, p_segment_id uuid DEFAULT null, p_link_slug text DEFAULT null
)
RETURNS event_invitations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_caller event_members; v_config jsonb; v_inv event_invitations; v_slug text;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'invitation', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create an invitation'; END IF;
  PERFORM assert_event_writable(p_event_id);
  PERFORM assert_plan(p_event_id, 'pages', 1);
  IF NOT EXISTS (SELECT 1 FROM event_days WHERE id = p_day_id AND event_id = p_event_id) THEN
    RAISE EXCEPTION 'Day not found for this event'; END IF;
  IF p_segment_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM event_segments WHERE id = p_segment_id AND day_id = p_day_id AND event_id = p_event_id) THEN
    RAISE EXCEPTION 'Segment not found for this day'; END IF;
  -- NEW: was an inline format/reserved/uniqueness block; no new row to exclude.
  v_slug := validate_invitation_link_slug(p_event_id, p_link_slug, NULL);
  IF EXISTS (SELECT 1 FROM event_invitations WHERE event_id = p_event_id AND day_id = p_day_id AND segment_id IS NOT DISTINCT FROM p_segment_id) THEN
    RAISE EXCEPTION 'An invitation already exists for this day/segment'; END IF;
  SELECT field_config INTO v_config FROM event_templates WHERE template_key = p_template_key AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Template not found or inactive'; END IF;
  INSERT INTO event_invitations (event_id, day_id, segment_id, template_key, link_slug, draft_config)
  VALUES (p_event_id, p_day_id, p_segment_id, p_template_key, v_slug, COALESCE(v_config, '{}'::jsonb))
  RETURNING * INTO v_inv;
  RETURN v_inv;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_invitation(uuid, text, uuid, uuid, text) TO authenticated;

-- 3) set_invitation_link_slug — re-paste of 20260807000001, block -> helper. ---
CREATE OR REPLACE FUNCTION public.set_invitation_link_slug(
  p_event_id uuid, p_id uuid, p_link_slug text DEFAULT NULL
)
RETURNS event_invitations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_inv    event_invitations;
  v_slug   text;
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
  PERFORM assert_event_writable(p_event_id);   -- paid/active + not over-limit

  -- NEW: was an inline copy of the block above; p_id excludes this row so a
  -- page never collides with itself.
  v_slug := validate_invitation_link_slug(p_event_id, p_link_slug, p_id);

  UPDATE event_invitations SET link_slug = v_slug
  WHERE id = p_id RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.set_invitation_link_slug(uuid, uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.set_invitation_link_slug(uuid, uuid, text) TO authenticated;

COMMIT;

-- Rollback:
--   1) Re-paste create_invitation        (20260618000106) — inline block back.
--   2) Re-paste set_invitation_link_slug (20260807000001) — inline block back.
--   3) DROP FUNCTION public.validate_invitation_link_slug(uuid, text, uuid);
