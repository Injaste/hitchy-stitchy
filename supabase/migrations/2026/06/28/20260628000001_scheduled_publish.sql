-- Migration: scheduled publish — let publish stamp a FUTURE published_at.
-- =============================================================================
-- Scheduled publish needs NO job/cron. published_at is already a timestamptz and
-- the public render is the visibility boundary, so "publish later" = publish now
-- (snapshot draft -> published_config immediately) but stamp published_at = T.
-- The render simply gates on `published_at <= now()`, so the page stays hidden
-- until T passes (lazy, exact-to-the-second). Cancel = unpublish (clears it).
--
-- Two changes:
--   1. update_invitation gains p_publish_at (default now()) — immediate publish
--      passes nothing and still goes live now.
--   2. get_public_invitation flips its 3 gates from `IS NOT NULL` to `<= now()`.
--
-- NOTE: the body below is the CURRENT update_invitation (promoted from
-- update_invitation_v2 in 20260627000103) — it keeps assert_event_writable + the
-- plan-cap clamp intact. The only additions are p_publish_at and the COALESCE.
-- =============================================================================

BEGIN;

-- Adding a parameter changes the signature, so drop the existing 13-arg overload
-- first (CREATE OR REPLACE would otherwise leave a second, ambiguous overload).
-- The DROP + CREATE run inside this transaction, so there's no window where the
-- function is missing for the live frontend.
DROP FUNCTION IF EXISTS public.update_invitation(
  uuid, uuid, text, jsonb, event_rsvp_mode, timestamptz, integer, integer,
  integer, text, jsonb, text, boolean
);

CREATE FUNCTION public.update_invitation(
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
  p_to_publish          boolean DEFAULT false,
  p_publish_at          timestamptz DEFAULT now()
)
RETURNS event_invitations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller     event_members;
  v_inv        event_invitations;
  v_mode       event_rsvp_mode;
  v_code       text;
  v_plan_cap   integer;
  v_max_guests integer;
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

  IF COALESCE(p_guest_count_max, v_inv.guest_count_max)
     < COALESCE(p_guest_count_min, v_inv.guest_count_min) THEN
    RAISE EXCEPTION 'Maximum guests cannot be less than the minimum'; END IF;

  v_mode := COALESCE(p_rsvp_mode, v_inv.rsvp_mode);
  v_code := NULLIF(btrim(p_private_code), '');
  IF v_mode = 'private' AND v_code IS NULL THEN
    RAISE EXCEPTION 'A private code is required for private RSVP mode';
  END IF;

  -- Page capacity can't exceed the plan cap; an unset cap DEFAULTS to it, so the
  -- per-page enforcement in submit_rsvp always carries the plan limit.
  SELECT max_guests INTO v_plan_cap FROM plans WHERE key = effective_plan_key(p_event_id);
  v_max_guests := COALESCE(p_max_guests, v_plan_cap);
  IF v_max_guests > v_plan_cap THEN
    RAISE EXCEPTION 'Guest capacity (%) can''t exceed your plan limit of %. Upgrade to Pro for more.', v_max_guests, v_plan_cap;
  END IF;

  UPDATE event_invitations SET
    template_key         = COALESCE(p_template_key, template_key),
    rsvp_deadline        = p_rsvp_deadline,
    max_guests           = v_max_guests,
    draft_config         = COALESCE(p_draft_config, draft_config),
    rsvp_mode            = COALESCE(p_rsvp_mode, rsvp_mode),
    guest_count_min      = COALESCE(p_guest_count_min, guest_count_min),
    guest_count_max      = COALESCE(p_guest_count_max, guest_count_max),
    confirmation_message = COALESCE(NULLIF(btrim(p_confirmation_message), ''), confirmation_message),
    rsvp_config          = COALESCE(p_rsvp_config, rsvp_config),
    private_code         = CASE WHEN v_mode = 'private' THEN v_code ELSE NULL END,
    -- Atomic publish: promote the just-written draft in the same statement.
    -- p_publish_at may be in the future (scheduled publish) — the render gates
    -- on `published_at <= now()`, so the snapshot stays hidden until then.
    published_config     = CASE WHEN p_to_publish THEN COALESCE(p_draft_config, draft_config) ELSE published_config END,
    published_at         = CASE WHEN p_to_publish THEN COALESCE(p_publish_at, now()) ELSE published_at END
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END; $$;
GRANT EXECUTE ON FUNCTION public.update_invitation(uuid, uuid, text, jsonb, event_rsvp_mode, timestamptz, integer, integer, integer, text, jsonb, text, boolean, timestamptz) TO authenticated;

-- get_public_invitation — gate on `published_at <= now()` so a future stamp
-- (scheduled page) stays hidden until its publish time passes.
CREATE OR REPLACE FUNCTION public.get_public_invitation(p_slug text, p_link_slug text DEFAULT null)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE v_event events; v_inv event_invitations; v_slug text := NULLIF(btrim(lower(p_link_slug)), '');
BEGIN
  SELECT * INTO v_event FROM events WHERE slug = p_slug AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF NOT is_event_active(v_event.id) THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_slug IS NOT NULL THEN
    SELECT * INTO v_inv FROM event_invitations WHERE event_id = v_event.id AND link_slug = v_slug AND published_at <= now();
  ELSE
    SELECT * INTO v_inv FROM event_invitations WHERE event_id = v_event.id AND link_slug IS NULL AND published_at <= now();
    IF NOT FOUND THEN
      SELECT i.* INTO v_inv FROM event_invitations i JOIN event_days d ON d.id = i.day_id
      WHERE i.event_id = v_event.id AND i.published_at <= now() ORDER BY d.date ASC, d.created_at ASC LIMIT 1;
    END IF;
  END IF;
  IF v_inv.id IS NULL THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  RETURN jsonb_build_object(
    'id', v_inv.id, 'event_id', v_inv.event_id,
    'event_date', v_inv.published_config->>'event_date',
    'event_time_start', v_inv.published_config->>'event_time_start',
    'event_time_end', null,
    'rsvp_mode', v_inv.rsvp_mode, 'rsvp_deadline', v_inv.rsvp_deadline, 'max_guests', v_inv.max_guests,
    'guest_count_min', v_inv.guest_count_min, 'guest_count_max', v_inv.guest_count_max,
    'confirmation_message', v_inv.confirmation_message, 'config', v_inv.rsvp_config,
    'published_page', jsonb_build_object('id', v_inv.id, 'theme_slug', v_inv.template_key, 'config', v_inv.published_config)
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.get_public_invitation(text, text) TO anon, authenticated;

COMMIT;

-- Rollback (restore the pre-scheduled-publish definitions):
--   BEGIN;
--   -- update_invitation: drop the 14-arg version, re-paste the 13-arg body from
--   -- 20260627000103 (assert_event_writable + plan-cap, published_at = now()).
--   DROP FUNCTION IF EXISTS public.update_invitation(
--     uuid, uuid, text, jsonb, event_rsvp_mode, timestamptz, integer, integer,
--     integer, text, jsonb, text, boolean, timestamptz);
--   -- (then re-CREATE the 13-arg update_invitation from 20260627000103 + GRANT)
--   -- get_public_invitation: re-CREATE OR REPLACE with the 3 gates back to
--   -- `published_at IS NOT NULL` (the pre-20260628 body).
--   COMMIT;
