-- Migration: seed a draft root invitation page; count pages by PUBLISHED
-- =============================================================================
-- Phase C-1 (docs/ux/phase-c-creation-and-lists.md §6). Guests currently
-- dead-end behind "Create an invitation first" (L4). Fix: create_event seeds one
-- unpublished, day-level ROOT page so guests always have somewhere to attach.
--
-- That only works if a draft doesn't consume the plan's page cap — otherwise a
-- Starter event (1 page) is at its limit the moment it is created. So the cap
-- moves from "rows" to "published rows", with a total-row ceiling as the
-- anti-abuse bound. Same two-clause shape plan_within_limits already uses for
-- guests (active <= max AND total-incl-cancelled <= grace ceiling): the real
-- entitlement counts what is live, a second clause stops row farming.
--
--   published <= max_invitation_pages
--   total     <= max_invitation_pages * 2 + 2
--
-- Three places count pages and they split differently:
--   • plan_within_limits  — the ADD check: both clauses.
--   • is_over_plan_limits — published only. A downgrade must not freeze an event
--                           over drafts nobody can see.
--   • get_bootstrap_context.usage.pages — published only, else usePlan()'s meter
--                           reads "1 of 5 used" on a brand-new Pro event because
--                           of a seed the couple never asked for.
--
-- Seed template is the literal 'cream-classic' — NOT "the first template". The
-- catalogue sorts ORDER BY name ASC, so "first" is an alphabet artifact that
-- moves when a template is added, and 14 of 16 templates are culture-specific
-- (docs/product-context.md: no community is the default). cream-classic is the
-- one authored neutral. When event type lands
-- (docs/todo/event-type-and-couple-flags.md) this constant becomes a lookup, in
-- the create_event re-paste that change already requires.
--
-- Bodies 1-4 are re-pastes of the confirmed-live definitions
-- (plan_within_limits = 20260718000002, is_over_plan_limits = 20260630000103,
-- get_bootstrap_context = 20260806000003, create_event = 20260806000001); the
-- only changed lines are marked NEW. Function 5 is additive.
-- One transaction.
-- =============================================================================

BEGIN;

-- 1) plan_within_limits — the 'pages' branch becomes two-clause. -------------
CREATE OR REPLACE FUNCTION public.plan_within_limits(
  p_event_id uuid,
  p_resource text,
  p_adding   int  DEFAULT 1,
  p_scope_id uuid DEFAULT NULL
)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_plan  plans;
  v_used  int;
  v_total int;
BEGIN
  SELECT p.* INTO v_plan FROM plans p WHERE p.key = effective_plan_key(p_event_id);
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  CASE p_resource
    -- feature flags
    WHEN 'budget'   THEN RETURN v_plan.can_use_budget;
    WHEN 'gifts'    THEN RETURN v_plan.can_use_gifts;
    WHEN 'vendors'  THEN RETURN v_plan.can_use_vendors;
    WHEN 'branding' THEN RETURN v_plan.can_remove_branding;

    -- numeric caps
    WHEN 'guests' THEN
      SELECT COALESCE(sum(guest_count) FILTER (WHERE status <> 'cancelled'), 0),
             COALESCE(sum(guest_count), 0)
        INTO v_used, v_total
        FROM event_rsvps WHERE event_id = p_event_id;
      RETURN v_used  + p_adding <= v_plan.max_guests
         AND v_total + p_adding <= floor(v_plan.max_guests * (1 + v_plan.cancelled_grace_pct));

    WHEN 'days' THEN
      SELECT count(*) INTO v_used FROM event_days WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_days;

    WHEN 'segments' THEN
      SELECT count(*) INTO v_used
      FROM event_segments WHERE day_id = p_scope_id AND name IS NOT NULL;
      RETURN v_used + p_adding <= v_plan.max_segments_per_day;

    -- NEW: entitlement counts PUBLISHED pages; total rows bounded for abuse.
    -- Drafts (published_at IS NULL) are free until they go live, which is what
    -- lets create_event seed one without spending the couple's only slot.
    WHEN 'pages' THEN
      SELECT count(*) FILTER (WHERE published_at IS NOT NULL), count(*)
        INTO v_used, v_total
        FROM event_invitations WHERE event_id = p_event_id;
      RETURN v_used  + p_adding <= v_plan.max_invitation_pages
         AND v_total + p_adding <= v_plan.max_invitation_pages * 2 + 2;

    WHEN 'members' THEN
      SELECT count(*) INTO v_used
      FROM event_members WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_members;

    WHEN 'timeline_items' THEN
      SELECT count(*) INTO v_used
      FROM event_timelines WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_timeline_items;

    WHEN 'expenses' THEN
      SELECT count(*) INTO v_used
      FROM event_expenses WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_expenses;

    WHEN 'gift_envelopes' THEN
      SELECT count(*) INTO v_used
      FROM event_gifts WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_gifts;

    WHEN 'tasks' THEN
      SELECT count(*) INTO v_used
      FROM event_tasks WHERE event_id = p_event_id AND archived_at IS NULL;
      RETURN v_used + p_adding <= v_plan.max_tasks;

    ELSE
      RAISE EXCEPTION 'Unknown plan resource: %', p_resource;
  END CASE;
END;
$$;

-- 2) is_over_plan_limits — the freeze gate counts published pages only. ------
CREATE OR REPLACE FUNCTION public.is_over_plan_limits(p_event_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_plan plans;
BEGIN
  SELECT p.* INTO v_plan FROM plans p WHERE p.key = effective_plan_key(p_event_id);
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF (SELECT count(*) FROM event_days WHERE event_id = p_event_id)
       > v_plan.max_days THEN RETURN true; END IF;

  -- ACTIVE (non-cancelled) guests only. Cancelled rows don't consume the plan's
  -- entitlement; the cancelled-grace anti-abuse lives in plan_within_limits'
  -- add-check (total-incl-cancelled <= grace ceiling), not here.
  IF (SELECT COALESCE(sum(guest_count) FILTER (WHERE status <> 'cancelled'), 0)
        FROM event_rsvps WHERE event_id = p_event_id)
       > v_plan.max_guests THEN RETURN true; END IF;

  IF (SELECT count(*) FROM event_members WHERE event_id = p_event_id)
       > v_plan.max_members THEN RETURN true; END IF;

  -- NEW: + FILTER. Same reasoning as guests — an unpublished page is invisible
  -- to the world and must not freeze the event after a downgrade. The draft
  -- ceiling is enforced on the ADD path, not here.
  IF (SELECT count(*) FILTER (WHERE published_at IS NOT NULL)
        FROM event_invitations WHERE event_id = p_event_id)
       > v_plan.max_invitation_pages THEN RETURN true; END IF;

  IF EXISTS (
    SELECT 1 FROM event_segments
    WHERE event_id = p_event_id AND name IS NOT NULL
    GROUP BY day_id
    HAVING count(*) > v_plan.max_segments_per_day
  ) THEN RETURN true; END IF;

  RETURN false;
END;
$$;

-- 3) get_bootstrap_context — usage.pages counts published only. --------------
CREATE OR REPLACE FUNCTION public.get_bootstrap_context(p_slug text)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_event        events;
  v_member       event_members;
  v_access_group event_access_groups;
  v_start        date;
  v_end          date;
  v_plan         plans;
BEGIN
  SELECT * INTO v_event FROM events WHERE slug = p_slug AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;

  SELECT * INTO v_member FROM event_members
  WHERE event_id = v_event.id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;

  IF v_member.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_SUSPENDED: Your access to this event has been suspended';
  END IF;
  IF v_member.joined_at IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_access_group FROM event_access_groups WHERE id = v_member.access_group_id;
  SELECT date_start, date_end INTO v_start, v_end FROM events_with_dates WHERE id = v_event.id;
  SELECT * INTO v_plan FROM plans WHERE key = effective_plan_key(v_event.id);

  RETURN json_build_object(
    'event_id',   v_event.id,
    'slug',       v_event.slug,
    'event_name', v_event.name,
    'date_start', v_start,
    'date_end',   v_end,
    'member', json_build_object(
      'id', v_member.id, 'display_name', v_member.display_name, 'role', v_member.role,
      'is_root', v_member.is_root, 'is_bride', v_member.is_bride, 'is_groom', v_member.is_groom
    ),
    'access_group', json_build_object(
      'id', v_access_group.id, 'code', v_access_group.code, 'name', v_access_group.name,
      'rank', v_access_group.rank, 'permissions', v_access_group.permissions
    ),
    'plan', json_build_object(
      'key',                 v_plan.key,
      'tier',                v_plan.tier,
      'name',                v_plan.name,
      'activated_at',        v_event.activated_at,
      'is_over_plan_limits', is_over_plan_limits(v_event.id),
      'limits', json_build_object(
        'max_days',             v_plan.max_days,
        'max_segments_per_day', v_plan.max_segments_per_day,
        'max_invitation_pages', v_plan.max_invitation_pages,
        'max_guests',           v_plan.max_guests,
        'max_members',          v_plan.max_members,
        'max_gifts',            v_plan.max_gifts,
        'max_expenses',         v_plan.max_expenses,
        'max_timeline_items',   v_plan.max_timeline_items,
        'max_tasks',            v_plan.max_tasks
      ),
      'features', json_build_object(
        'timeline',         v_plan.can_use_timeline,
        'timeline_liverun', v_plan.can_use_timeline_liverun,
        'tasks',            v_plan.can_use_tasks,
        'members',          v_plan.can_use_members,
        'access',           v_plan.can_use_access,
        'guests',           v_plan.can_use_guests,
        'budget',           v_plan.can_use_budget,
        'gifts',            v_plan.can_use_gifts,
        'vendors',          v_plan.can_use_vendors,
        'invitation',       v_plan.can_use_invitation,
        'branding',         v_plan.can_remove_branding
      ),
      'usage', json_build_object(
        'days',    (SELECT count(*) FROM event_days WHERE event_id = v_event.id),
        'guests',  (SELECT COALESCE(sum(guest_count), 0) FROM event_rsvps
                    WHERE event_id = v_event.id AND status <> 'cancelled'),
        'members', (SELECT count(*) FROM event_members WHERE event_id = v_event.id),
        -- NEW: + published_at filter. The meter must reflect the entitlement it
        -- is metering, and the entitlement is published pages.
        'pages',   (SELECT count(*) FROM event_invitations
                    WHERE event_id = v_event.id AND published_at IS NOT NULL),
        'timeline_items', (SELECT count(*) FROM event_timelines WHERE event_id = v_event.id),
        'tasks',   (SELECT count(*) FROM event_tasks
                    WHERE event_id = v_event.id AND archived_at IS NULL)
      )
    ),
    'catalog', COALESCE((
      SELECT json_agg(json_build_object(
        'tier', tier, 'rank', rank, 'name', name, 'price', price, 'is_free_tier', is_free_tier,
        'limits', json_build_object(
          'max_days', max_days, 'max_segments_per_day', max_segments_per_day,
          'max_invitation_pages', max_invitation_pages, 'max_guests', max_guests,
          'max_members', max_members, 'max_gifts', max_gifts, 'max_expenses', max_expenses,
          'max_timeline_items', max_timeline_items,
          'max_tasks', max_tasks
        ),
        'features', json_build_object(
          'timeline', can_use_timeline, 'timeline_liverun', can_use_timeline_liverun,
          'tasks', can_use_tasks, 'members', can_use_members,
          'access', can_use_access, 'guests', can_use_guests, 'budget', can_use_budget,
          'gifts', can_use_gifts, 'vendors', can_use_vendors,
          'invitation', can_use_invitation, 'branding', can_remove_branding
        )
      ) ORDER BY rank)
      FROM plans WHERE is_active
    ), '[]'::json)
  );
END;
$$;

-- 4) create_event — seed one draft root page on the earliest day. ------------
CREATE OR REPLACE FUNCTION public.create_event(
  p_slug         text,
  p_name         text,
  p_days         jsonb,
  p_display_name text,
  p_role         text
)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_event_id  uuid;
  v_slug      text;
  v_helper_id uuid;
  v_admin_id  uuid;
  v_member_id uuid;
  v_day_id    uuid;
  v_start     date;
  v_end       date;
  v_free_available boolean;
  v_seed_day_id uuid;   -- NEW: earliest day, the seeded page's home
  v_seed_config jsonb;  -- NEW: the seed template's base draft_config
  rec         record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  IF p_days IS NULL OR jsonb_array_length(p_days) = 0 THEN
    RAISE EXCEPTION 'Select at least one event day';
  END IF;

  IF is_slug_taken(p_slug) THEN
    RAISE EXCEPTION 'This URL is already taken' USING ERRCODE = 'unique_violation';
  END IF;

  SELECT min((d->>'date')::date), max((d->>'date')::date)
  INTO v_start, v_end
  FROM jsonb_array_elements(p_days) AS d;

  v_free_available := free_event_available(v_user_id);

  INSERT INTO events (slug, name, activated_at)
  VALUES (p_slug, p_name, CASE WHEN v_free_available THEN now() ELSE NULL END)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  -- Helper: full ops, no money, members:read (sees the roster, cannot act on
  -- it). Co-owner: full ops + full money + members:full (identity/access
  -- management — locked to this group by the trigger above).
  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'helper', 'Helper', 3, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"read","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_helper_id;

  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'admin', 'Co-owner', 2, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read",
    "budget":"full","gifts":"full"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  -- Creator (root/Owner) placed in Co-owner as the NOT NULL placeholder; the
  -- is_super_admin flag, not the group, grants their power.
  INSERT INTO event_members (
    event_id, user_id, display_name, access_group_id,
    role, is_root, is_bride, is_groom, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, p_display_name, v_admin_id,
    p_role, true, (p_role = 'Bride'), (p_role = 'Groom'), now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_settings (event_id) VALUES (v_event_id);

  FOR rec IN
    SELECT DISTINCT ON (dt) dt AS date, lbl AS label
    FROM (
      SELECT (d->>'date')::date              AS dt,
             btrim(COALESCE(d->>'label', '')) AS lbl
      FROM jsonb_array_elements(p_days) AS d
    ) s
    ORDER BY dt
  LOOP
    IF rec.label = '' THEN
      RAISE EXCEPTION 'Each event day needs a label';
    END IF;

    INSERT INTO event_days (event_id, date, label)
    VALUES (v_event_id, rec.date, rec.label)
    RETURNING event_days.id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);

    -- NEW: the loop is ORDER BY dt, so the first pass is the earliest day.
    IF v_seed_day_id IS NULL THEN
      v_seed_day_id := v_day_id;
    END IF;
  END LOOP;

  -- NEW: one unpublished, day-level ROOT page so Guests never dead-ends on an
  -- unvisited Invitation screen (L4). Unpublished, so it costs nothing against
  -- max_invitation_pages and stays invisible on the public site until the
  -- couple publishes it. Deliberately ONE page, not one per day — the seed is a
  -- starting point, not a pre-filled allocation.
  --
  -- No assert_plan here: the seed is the product's doing, not the user's, and
  -- 2n+2 is >= 4 on every tier. Skipped if the neutral template is missing —
  -- an absent seed is recoverable, a failed event creation is not.
  SELECT field_config INTO v_seed_config
  FROM event_templates
  WHERE template_key = 'cream-classic' AND is_active = true;

  IF FOUND THEN
    INSERT INTO event_invitations (
      event_id, day_id, segment_id, template_key, link_slug, draft_config
    )
    VALUES (
      v_event_id, v_seed_day_id, NULL, 'cream-classic', NULL,
      COALESCE(v_seed_config, '{}'::jsonb)
    );
  END IF;

  DELETE FROM slug_reservations WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, v_start, v_end, NOT v_free_available;
END;
$$;

-- 5) set_invitation_link_slug — NEW. ----------------------------------------
-- The seed claims the root slot (link_slug IS NULL), and create_invitation is
-- the only writer of link_slug today, so without this the couple's main link is
-- permanently day 1's page. Kept separate from update_invitation rather than
-- growing that 14-arg signature into an overload: link_slug is URL identity,
-- update_invitation is content + RSVP config.
--
-- Validation mirrors create_invitation exactly, with `id <> p_id` added so a
-- page never collides with itself.
CREATE OR REPLACE FUNCTION public.set_invitation_link_slug(
  p_event_id uuid, p_id uuid, p_link_slug text DEFAULT NULL
)
RETURNS event_invitations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_inv    event_invitations;
  v_slug   text := NULLIF(btrim(lower(p_link_slug)), '');
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

  IF v_slug IS NULL THEN
    IF EXISTS (SELECT 1 FROM event_invitations
               WHERE event_id = p_event_id AND link_slug IS NULL AND id <> p_id) THEN
      RAISE EXCEPTION 'A root link already exists — choose a link path'; END IF;
  ELSE
    IF v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
      RAISE EXCEPTION 'Link path may use only lowercase letters, numbers and hyphens'; END IF;
    IF EXISTS (SELECT 1 FROM slug_reservations WHERE slug = v_slug AND expires_at IS NULL) THEN
      RAISE EXCEPTION 'That link path is reserved'; END IF;
    IF EXISTS (SELECT 1 FROM event_invitations
               WHERE event_id = p_event_id AND link_slug = v_slug AND id <> p_id) THEN
      RAISE EXCEPTION 'That link path is already in use'; END IF;
  END IF;

  UPDATE event_invitations SET link_slug = v_slug
  WHERE id = p_id RETURNING * INTO v_inv;
  RETURN v_inv;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.set_invitation_link_slug(uuid, uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.set_invitation_link_slug(uuid, uuid, text) TO authenticated;

COMMIT;

-- Rollback:
--   1) Re-paste plan_within_limits  (20260718000002) — pages branch = count(*).
--   2) Re-paste is_over_plan_limits (20260630000103) — pages clause, no FILTER.
--   3) Re-paste get_bootstrap_context (20260806000003) — usage.pages = count(*).
--   4) Re-paste create_event        (20260806000001) — no seed block.
--   5) DROP FUNCTION public.set_invitation_link_slug(uuid, uuid, text);
-- Existing seeded rows are ordinary unpublished pages; delete them per event if
-- the rollback needs the counts to match the old (all-rows) semantics.
