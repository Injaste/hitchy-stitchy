-- Migration: Solo plans catalog (definitive) — data-driven, every feature/cap accounted
-- =============================================================================
-- The SOLO (individual) per-event plan catalog, rebuilt as the single source of
-- truth the frontend reads (no hardcoded tier lists / feature maps). Agency plans
-- are a SEPARATE future scheme (account subscription that REFERENCES a solo tier
-- via FK + caps events/month); nothing here needs to change for them.
--
-- Architecture locked here:
--  • Identity:   key = solo_N_vM (immutable pin target; version lives in the key),
--                tier = solo_N (groups versions). Format-checked.
--  • Versioning: is_active marks the ONE live, sellable version of a tier
--                (≤1 per tier). Events pin to a KEY, so superseding a tier
--                (insert solo_N_v2, flip is_active) never disturbs existing events
--                — that's grandfathering. is_active=false = retired OR not-yet-sold.
--  • Ladder:     rank (reorderable) — the catalog ladder is `is_active ORDER BY rank`.
--  • Allowance:  is_free_tier marks the $0 first-event tier (entry price is the
--                $50 SUBSEQUENT-event fee, not 0 — so it can't be detected by price).
--  • Coverage:   every page = a can_use_* feature (invitation+guests INCLUDED);
--                every countable = a max_* cap (gifts/expenses INCLUDED).
--                Nothing is unlimited — fair use everywhere.
--
-- Scope now: Starter + Plus (same features = invitation + guests only; differ only
-- in guest cap). Pro/Advanced + the gift/budget caps exist as columns but seed 0 /
-- locked; their server enforcement (assert_plan, is_over) is added additively when
-- a tier actually unlocks them.
--
-- NB: 20260626000101 (starter_plan_limits) is already applied; this rebuild
-- supersedes it. APPLY THIS ONLY AFTER the matching frontend pass lands (the
-- bootstrap return shape changes). One transaction.
-- =============================================================================

BEGIN;

DROP VIEW IF EXISTS public.plans_public;
ALTER TABLE public.events          DROP CONSTRAINT IF EXISTS events_plan_key_fk;
ALTER TABLE public.event_purchases DROP CONSTRAINT IF EXISTS event_purchases_plan_key_fk;
DROP TABLE IF EXISTS public.plans;

CREATE TABLE public.plans (
  -- identity & versioning
  key                  text        PRIMARY KEY,           -- solo_N_vM, immutable pin target
  tier                 text        NOT NULL,              -- solo_N, groups versions
  rank                 int         NOT NULL,              -- ladder position (reorderable)
  name                 text        NOT NULL,              -- brand label, user-facing
  is_active            boolean     NOT NULL DEFAULT true, -- the live, sellable version of this tier
  is_free_tier         boolean     NOT NULL DEFAULT false,-- grants the $0 first-event allowance
  -- pricing (cancelled_grace_pct + stripe_price_id NEVER reach the client)
  price                numeric(12,2),
  stripe_price_id      text,
  cancelled_grace_pct  numeric     NOT NULL DEFAULT 0.04,
  -- countable caps — every resource is metered; nothing unlimited
  max_days             int         NOT NULL,
  max_segments_per_day int         NOT NULL,
  max_invitation_pages int         NOT NULL,
  max_guests           int         NOT NULL,
  max_members          int         NOT NULL,
  max_gifts            int         NOT NULL DEFAULT 0,
  max_expenses         int         NOT NULL DEFAULT 0,
  -- feature flags — every page/module accounted for, in route order
  -- (invitation + guests included; branding is the non-page perk, last)
  can_use_timeline     boolean     NOT NULL DEFAULT false,
  can_use_tasks        boolean     NOT NULL DEFAULT false,
  can_use_members      boolean     NOT NULL DEFAULT false,
  can_use_access       boolean     NOT NULL DEFAULT false,
  can_use_guests       boolean     NOT NULL DEFAULT true,
  can_use_budget       boolean     NOT NULL DEFAULT false,
  can_use_gifts        boolean     NOT NULL DEFAULT false,
  can_use_invitation   boolean     NOT NULL DEFAULT true,
  can_remove_branding  boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT plans_key_format   CHECK (key  ~ '^solo_\d+_v\d+$'),
  CONSTRAINT plans_tier_format  CHECK (tier ~ '^solo_\d+$'),
  CONSTRAINT plans_price_nonneg CHECK (price IS NULL OR price >= 0)
);

-- ≤ 1 sellable version per tier; ≤ 1 active free/entry tier.
CREATE UNIQUE INDEX plans_one_active_per_tier ON public.plans (tier)         WHERE is_active;
CREATE UNIQUE INDEX plans_one_active_free     ON public.plans (is_free_tier) WHERE is_free_tier AND is_active;

-- RLS: table not client-readable (clients read the masked view); SECURITY DEFINER
-- functions read it server-side.
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Safe public projection — the live ladder, brand + price only (no grace/SKU).
CREATE VIEW public.plans_public AS
  SELECT key, tier, name, rank, is_free_tier,
         max_days, max_segments_per_day, max_invitation_pages, max_guests,
         max_members, max_gifts, max_expenses,
         can_use_timeline, can_use_tasks, can_use_members, can_use_access,
         can_use_guests, can_use_budget, can_use_gifts, can_use_invitation,
         can_remove_branding,
         price
  FROM public.plans
  WHERE is_active;
GRANT SELECT ON public.plans_public TO anon, authenticated;

-- Seed Starter + Plus. Identical features (invitation + guests only); differ only
-- in guest cap (50 vs 500). gifts/budget locked → their caps are 0.
INSERT INTO public.plans (
  key, tier, rank, name, is_active, is_free_tier, price, stripe_price_id,
  max_days, max_segments_per_day, max_invitation_pages, max_guests, max_members,
  max_gifts, max_expenses,
  can_use_timeline, can_use_tasks, can_use_members, can_use_access,
  can_use_guests, can_use_budget, can_use_gifts, can_use_invitation, can_remove_branding
) VALUES
  -- features in route order: timeline,tasks,members,access,guests,budget,gifts,invitation,branding
  ('solo_1_v1','solo_1',1,'Starter',true,true, 50,  NULL,
   1, 1, 1, 50,  2,  0, 0,
   false, false, false, false, true, false, false, true, false),
  ('solo_2_v1','solo_2',2,'Plus',   true,false,140, NULL,
   1, 1, 1, 500, 2,  0, 0,
   false, false, false, false, true, false, false, true, false);

-- Repoint the FK holders to the new keys (legacy free/pro → entry tier; pro has no
-- equivalent yet), restore default, re-add FKs.
UPDATE public.events SET plan_key = 'solo_1_v1' WHERE plan_key <> 'solo_2_v1';
ALTER TABLE public.events ALTER COLUMN plan_key SET DEFAULT 'solo_1_v1';
UPDATE public.event_purchases SET plan_key = 'solo_1_v1' WHERE plan_key <> 'solo_2_v1';

ALTER TABLE public.events
  ADD CONSTRAINT events_plan_key_fk          FOREIGN KEY (plan_key) REFERENCES public.plans (key);
ALTER TABLE public.event_purchases
  ADD CONSTRAINT event_purchases_plan_key_fk FOREIGN KEY (plan_key) REFERENCES public.plans (key);

-- $0 first-event allowance keys off is_free_tier (data), not a magic string.
CREATE OR REPLACE FUNCTION public.free_event_available(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM events e
    JOIN event_members owner
      ON owner.event_id = e.id AND owner.is_root AND owner.user_id = p_user_id
    JOIN plans p ON p.key = e.plan_key
    WHERE p.is_free_tier
      AND e.activated_at IS NOT NULL
      AND e.deleted_at IS NULL
  );
$$;

-- Bootstrap: emit the event's plan (limits = caps, features = a flag MAP so the
-- client never hand-maps), the usage, and the CATALOG ladder (active tiers ordered
-- by rank) so the frontend derives tierRank/nextTier from the DB, not a constant.
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
      -- caps (cancelled_grace_pct deliberately NOT exposed)
      'limits', json_build_object(
        'max_days',             v_plan.max_days,
        'max_segments_per_day', v_plan.max_segments_per_day,
        'max_invitation_pages', v_plan.max_invitation_pages,
        'max_guests',           v_plan.max_guests,
        'max_members',          v_plan.max_members,
        'max_gifts',            v_plan.max_gifts,
        'max_expenses',         v_plan.max_expenses
      ),
      -- feature flags as a MAP keyed by feature (drives canUseFeature; no hand-map)
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
      -- usage (gifts/expenses added when a tier unlocks them — locked here)
      'usage', json_build_object(
        'days',    (SELECT count(*) FROM event_days WHERE event_id = v_event.id),
        'guests',  (SELECT COALESCE(sum(guest_count), 0) FROM event_rsvps
                    WHERE event_id = v_event.id AND status <> 'cancelled'),
        'members', (SELECT count(*) FROM event_members WHERE event_id = v_event.id),
        'pages',   (SELECT count(*) FROM event_invitations WHERE event_id = v_event.id)
      )
    ),
    -- the live ladder, DB-driven (frontend derives rank/nextTier from this)
    'catalog', COALESCE((
      SELECT json_agg(json_build_object(
        'tier', tier, 'rank', rank, 'name', name, 'price', price, 'is_free_tier', is_free_tier
      ) ORDER BY rank)
      FROM plans WHERE is_active
    ), '[]'::json)
  );
END;
$$;

COMMIT;

-- Rollback: pre-launch reshape; restore 20260618000101's plans + reseed, repoint
-- events/event_purchases, re-add FKs, re-paste 20260626000101's free_event_available
-- + get_bootstrap_context.
