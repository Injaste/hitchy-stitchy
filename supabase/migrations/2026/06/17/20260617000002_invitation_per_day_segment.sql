-- Migration: per-(day, segment) invitation pages + link_slug (Step 3B).
-- =============================================================================
-- The invitation becomes per-(event, day, segment): day_id is now REQUIRED,
-- segment_id stays nullable (NULL = a day-level page). A new link_slug gives each
-- page its URL path under the event slug (/:slug/:link_slug); NULL link_slug = the
-- event root (/:slug). The per-invitation `name` is dropped — the tile/title
-- derives from segment.name ?? day.label.
--
-- Two independent uniqueness invariants, both plain constraints (no triggers):
--   * (event_id, day_id, segment_id) NULLS NOT DISTINCT — one page per day/segment
--     SLOT (already present from Step 1; segment_id NULL collapses to one day-level).
--   * (event_id, link_slug)         NULLS NOT DISTINCT — unique URLs AND at most one
--     NULL (root) per event. So the first link can be the root; subsequent links
--     each need a non-null link_slug.
--
-- day_id FK flips CASCADE -> RESTRICT and delete_day gains an invitation guard, so
-- a day with a page can't be silently deleted (symmetric with items/expenses/gifts).
--
-- Backfill: each existing one-per-event row (day_id NULL) is pinned to the event's
-- first-by-date day as the root (link_slug stays NULL). All data is dev/test.
-- =============================================================================

-- 1. link_slug column. -------------------------------------------------------
ALTER TABLE public.event_invitations ADD COLUMN IF NOT EXISTS link_slug text;

-- 2. Backfill day_id to the first-by-date day, then require it. ---------------
UPDATE public.event_invitations i
SET day_id = (
  SELECT d.id FROM public.event_days d
  WHERE d.event_id = i.event_id
  ORDER BY d.date ASC, d.created_at ASC
  LIMIT 1
)
WHERE i.day_id IS NULL;

ALTER TABLE public.event_invitations ALTER COLUMN day_id SET NOT NULL;

-- 3. day_id FK CASCADE -> RESTRICT (a day with a page can't be silently dropped).
ALTER TABLE public.event_invitations
  DROP CONSTRAINT event_invitations_day_id_fk,
  ADD CONSTRAINT event_invitations_day_id_fk
    FOREIGN KEY (day_id) REFERENCES public.event_days (id) ON DELETE RESTRICT;

-- 4. Unique URL per event + at most one root (NULL) per event. ----------------
ALTER TABLE public.event_invitations
  ADD CONSTRAINT event_invitations_event_link_slug_key
    UNIQUE NULLS NOT DISTINCT (event_id, link_slug);

-- 4b. Seed the permanent reserved paths (expires_at NULL = never expires) into the
--     existing slug_reservations blocklist — the single source of truth for reserved
--     slugs. These are the /:slug/* route siblings, so no event slug OR invitation
--     link_slug may claim them. user_id is a system sentinel (nil uuid): the table
--     has no FK on user_id, and the nil uuid is distinct from every real auth.uid(),
--     so is_slug_taken / reserve_slug already treat these as permanently held.
INSERT INTO public.slug_reservations (slug, user_id, expires_at) VALUES
  ('join',  '00000000-0000-0000-0000-000000000000', null),
  ('admin', '00000000-0000-0000-0000-000000000000', null)
ON CONFLICT (slug) DO UPDATE SET expires_at = null, user_id = excluded.user_id;

-- 5. create_invitation — now requires a day, takes an optional segment + link_slug;
--    seeds draft_config from the template base config. Drops p_name.
--    Guardrails: member-active -> permission -> day∈event -> segment∈day∈event ->
--    link_slug (format/reserved/unique, or single root) -> slot-unique -> template.
DROP FUNCTION IF EXISTS public.create_invitation(uuid, text, text);

CREATE OR REPLACE FUNCTION public.create_invitation(
  p_event_id     uuid,
  p_template_key text,
  p_day_id       uuid,
  p_segment_id   uuid DEFAULT null,
  p_link_slug    text DEFAULT null
)
RETURNS event_invitations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller event_members;
  v_config jsonb;
  v_inv    event_invitations;
  v_slug   text := NULLIF(btrim(lower(p_link_slug)), '');
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;
  IF NOT has_event_permission(p_event_id, 'invitation', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create an invitation';
  END IF;

  -- Day must belong to this event.
  IF NOT EXISTS (
    SELECT 1 FROM event_days WHERE id = p_day_id AND event_id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Day not found for this event';
  END IF;

  -- Segment (optional) must belong to that day + event.
  IF p_segment_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM event_segments
    WHERE id = p_segment_id AND day_id = p_day_id AND event_id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Segment not found for this day';
  END IF;

  -- link_slug: NULL = the event root (/:slug) — at most one per event. Otherwise a
  -- valid, non-reserved, unique path. (Constraints backstop; this is the friendly message.)
  IF v_slug IS NULL THEN
    IF EXISTS (SELECT 1 FROM event_invitations WHERE event_id = p_event_id AND link_slug IS NULL) THEN
      RAISE EXCEPTION 'A root link already exists — choose a link path';
    END IF;
  ELSE
    IF v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
      RAISE EXCEPTION 'Link path may use only lowercase letters, numbers and hyphens';
    END IF;
    -- Reserved = a permanent (never-expiring) slug_reservations entry.
    IF EXISTS (SELECT 1 FROM slug_reservations WHERE slug = v_slug AND expires_at IS NULL) THEN
      RAISE EXCEPTION 'That link path is reserved';
    END IF;
    IF EXISTS (SELECT 1 FROM event_invitations WHERE event_id = p_event_id AND link_slug = v_slug) THEN
      RAISE EXCEPTION 'That link path is already in use';
    END IF;
  END IF;

  -- One page per (day, segment) slot.
  IF EXISTS (
    SELECT 1 FROM event_invitations
    WHERE event_id = p_event_id AND day_id = p_day_id
      AND segment_id IS NOT DISTINCT FROM p_segment_id
  ) THEN
    RAISE EXCEPTION 'An invitation already exists for this day/segment';
  END IF;

  SELECT field_config INTO v_config FROM event_templates
  WHERE template_key = p_template_key AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;

  INSERT INTO event_invitations (event_id, day_id, segment_id, template_key, link_slug, draft_config)
  VALUES (p_event_id, p_day_id, p_segment_id, p_template_key, v_slug, COALESCE(v_config, '{}'::jsonb))
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_invitation(uuid, text, uuid, uuid, text) TO authenticated;

-- 6. update_invitation — drop p_name (column gone). link_slug is NOT edited here
--    (set at create; a dedicated rename can come later) so "keep vs clear" never
--    arises. Guardrails unchanged: row∈event -> member-active -> permission -> min≤max.
DROP FUNCTION IF EXISTS public.update_invitation(
  uuid, uuid, text, text, jsonb, event_rsvp_mode, timestamptz,
  integer, integer, integer, text, jsonb, boolean
);

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
    draft_config         = COALESCE(p_draft_config, draft_config),
    rsvp_mode            = COALESCE(p_rsvp_mode, rsvp_mode),
    guest_count_min      = COALESCE(p_guest_count_min, guest_count_min),
    guest_count_max      = COALESCE(p_guest_count_max, guest_count_max),
    confirmation_message = COALESCE(NULLIF(btrim(p_confirmation_message), ''), confirmation_message),
    rsvp_config          = COALESCE(p_rsvp_config, rsvp_config),
    published_config     = CASE WHEN p_to_publish
                                THEN COALESCE(p_draft_config, draft_config)
                                ELSE published_config END,
    published_at         = CASE WHEN p_to_publish THEN now() ELSE published_at END
  WHERE id = p_id
  RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_invitation(
  uuid, uuid, text, jsonb, event_rsvp_mode, timestamptz, integer, integer, integer, text, jsonb, boolean
) TO authenticated;

-- 7. Drop the per-invitation name (tile/title now derives from segment/day). ----
--    Functions above no longer reference it; safe to drop.
ALTER TABLE public.event_invitations DROP COLUMN IF EXISTS name;

-- 8. delete_day — add the invitation guard. Re-pastes the current body
--    (schema.sql: items + expenses + gifts) verbatim with one extra block.
CREATE OR REPLACE FUNCTION public.delete_day(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count       integer;
  v_items       integer;
  v_expenses    integer;
  v_gifts       integer;
  v_invitations integer;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to delete days';
  END IF;

  SELECT count(*) INTO v_count FROM event_days WHERE event_id = p_event_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'An event must keep at least one day';
  END IF;

  SELECT count(*) INTO v_items
  FROM event_timelines t
  JOIN event_segments s ON s.id = t.segment_id
  WHERE s.day_id = p_id AND t.event_id = p_event_id;
  IF v_items > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % schedule item(s) before deleting it', v_items;
  END IF;

  SELECT count(*) INTO v_expenses
  FROM event_expenses e
  JOIN event_budget b ON b.id = e.budget_id
  WHERE b.day_id = p_id AND e.event_id = p_event_id;
  IF v_expenses > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % expense(s) before deleting it', v_expenses;
  END IF;

  SELECT count(*) INTO v_gifts
  FROM event_gifts WHERE day_id = p_id AND event_id = p_event_id;
  IF v_gifts > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % gift(s) before deleting it', v_gifts;
  END IF;

  -- Invitations attach via event_invitations.day_id (RESTRICT FK). Count here so
  -- it reads as a message rather than a raw FK violation.
  SELECT count(*) INTO v_invitations
  FROM event_invitations WHERE day_id = p_id AND event_id = p_event_id;
  IF v_invitations > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % invitation(s) before deleting it', v_invitations;
  END IF;

  DELETE FROM event_days WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;
END;
$$;

-- 9. get_public_invitation — now resolves by link_slug (the 3A body filtered
--    day_id IS NULL, which matches nothing once day_id is required). Bare /:slug
--    (p_link_slug NULL) -> the root page (link_slug IS NULL), else fallback to the
--    first-by-date published page. /:slug/:link_slug -> that page. Same guardrails
--    (event live via is_event_active; published gate) -> else 'Invitation not found'.
CREATE OR REPLACE FUNCTION public.get_public_invitation(p_slug text, p_link_slug text DEFAULT null)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_event events;
  v_inv   event_invitations;
  v_slug  text := NULLIF(btrim(lower(p_link_slug)), '');
BEGIN
  SELECT * INTO v_event FROM events WHERE slug = p_slug AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF NOT is_event_active(v_event.id) THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  IF v_slug IS NOT NULL THEN
    SELECT * INTO v_inv FROM event_invitations
    WHERE event_id = v_event.id AND link_slug = v_slug AND published_at IS NOT NULL;
  ELSE
    -- Root page first; else the first-by-date published page.
    SELECT * INTO v_inv FROM event_invitations
    WHERE event_id = v_event.id AND link_slug IS NULL AND published_at IS NOT NULL;
    IF NOT FOUND THEN
      SELECT i.* INTO v_inv FROM event_invitations i
      JOIN event_days d ON d.id = i.day_id
      WHERE i.event_id = v_event.id AND i.published_at IS NOT NULL
      ORDER BY d.date ASC, d.created_at ASC
      LIMIT 1;
    END IF;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;

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
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_invitation(text, text) TO anon, authenticated;

-- Rollback:
--   ALTER TABLE public.event_invitations ADD COLUMN name text NOT NULL DEFAULT 'My Invitation';
--   ALTER TABLE public.event_invitations DROP CONSTRAINT event_invitations_event_link_slug_key;
--   ALTER TABLE public.event_invitations DROP COLUMN link_slug;
--   ALTER TABLE public.event_invitations ALTER COLUMN day_id DROP NOT NULL;
--   ALTER TABLE public.event_invitations DROP CONSTRAINT event_invitations_day_id_fk,
--     ADD CONSTRAINT event_invitations_day_id_fk FOREIGN KEY (day_id) REFERENCES event_days(id) ON DELETE CASCADE;
--   (restore create_invitation/update_invitation from 20260616000001-2; restore delete_day from 20260613000002)
