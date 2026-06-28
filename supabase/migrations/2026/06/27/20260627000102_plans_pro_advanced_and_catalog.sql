-- Migration: seed Pro + Advanced, enrich the bootstrap catalog, drop plans_public
-- =============================================================================
-- 1) Seed solo_3 (Pro) + solo_4 (Advanced) — fills out the ladder. Pro unlocks the
--    planning suite + budget/gifts ("controlled" = the 200 caps); Advanced unlocks
--    everything incl. branding removal, with the highest (still finite) caps.
-- 2) Enrich the `catalog` the bootstrap returns with each tier's full caps +
--    features, so the client derives the upgrade DIFF (what's unlocked / raised)
--    straight from the bootstrap — no separate client fetch.
-- 3) Drop plans_public: the client now reads the catalog from the bootstrap RPC
--    (a SECURITY DEFINER function that already bypasses RLS correctly), so the
--    masking view is no longer used. Re-add it (definer) if a public pricing page
--    ever needs anon access.
-- One transaction.
-- =============================================================================

BEGIN;

INSERT INTO public.plans (
  key, tier, rank, name, is_active, is_free_tier, price, stripe_price_id,
  max_days, max_segments_per_day, max_invitation_pages, max_guests, max_members,
  max_gifts, max_expenses,
  can_use_timeline, can_use_tasks, can_use_members, can_use_access,
  can_use_guests, can_use_budget, can_use_gifts, can_use_invitation, can_remove_branding
) VALUES
  -- Pro: full planning suite + budget/gifts (controlled = 200 caps)
  ('solo_3_v1','solo_3',3,'Pro',     true,false,400, NULL,
   5,  5,  5,  1000, 10, 200,  200,
   true, true, true, true, true, true, true, true, false),
  -- Advanced: everything incl. branding removal, highest finite caps
  ('solo_4_v1','solo_4',4,'Advanced',true,false,1000,NULL,
   14, 10, 10, 5000, 30, 2000, 2000,
   true, true, true, true, true, true, true, true, true)
ON CONFLICT (key) DO NOTHING;

-- The client reads the catalog from the bootstrap RPC now; retire the view.
DROP VIEW IF EXISTS public.plans_public;

-- Re-paste get_bootstrap_context (from 20260627000101) with the catalog enriched
-- to carry each tier's caps + features (for the upgrade diff). Nothing else changed.
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
      'id', v_access_group.id, 'name', v_access_group.name, 'permissions', v_access_group.permissions
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
        'max_expenses',         v_plan.max_expenses
      ),
      'features', json_build_object(
        'timeline',   v_plan.can_use_timeline,
        'tasks',      v_plan.can_use_tasks,
        'members',    v_plan.can_use_members,
        'access',     v_plan.can_use_access,
        'guests',     v_plan.can_use_guests,
        'budget',     v_plan.can_use_budget,
        'gifts',      v_plan.can_use_gifts,
        'invitation', v_plan.can_use_invitation,
        'branding',   v_plan.can_remove_branding
      ),
      'usage', json_build_object(
        'days',    (SELECT count(*) FROM event_days WHERE event_id = v_event.id),
        'guests',  (SELECT COALESCE(sum(guest_count), 0) FROM event_rsvps
                    WHERE event_id = v_event.id AND status <> 'cancelled'),
        'members', (SELECT count(*) FROM event_members WHERE event_id = v_event.id),
        'pages',   (SELECT count(*) FROM event_invitations WHERE event_id = v_event.id)
      )
    ),
    -- the live ladder, enriched with each tier's caps + features (drives the
    -- upgrade diff: what the next tier unlocks / raises). price stays in the data
    -- but is NOT displayed anywhere in the app yet.
    'catalog', COALESCE((
      SELECT json_agg(json_build_object(
        'tier', tier, 'rank', rank, 'name', name, 'price', price, 'is_free_tier', is_free_tier,
        'limits', json_build_object(
          'max_days', max_days, 'max_segments_per_day', max_segments_per_day,
          'max_invitation_pages', max_invitation_pages, 'max_guests', max_guests,
          'max_members', max_members, 'max_gifts', max_gifts, 'max_expenses', max_expenses
        ),
        'features', json_build_object(
          'timeline', can_use_timeline, 'tasks', can_use_tasks, 'members', can_use_members,
          'access', can_use_access, 'guests', can_use_guests, 'budget', can_use_budget,
          'gifts', can_use_gifts, 'invitation', can_use_invitation, 'branding', can_remove_branding
        )
      ) ORDER BY rank)
      FROM plans WHERE is_active
    ), '[]'::json)
  );
END;
$$;

COMMIT;

-- Rollback: DELETE solo_3_v1/solo_4_v1; recreate plans_public (see 20260627000101)
-- with security_invoker=false; re-paste 20260627000101's get_bootstrap_context.
