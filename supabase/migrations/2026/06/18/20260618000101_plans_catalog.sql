-- Migration: Subscription plans (101) — versioned plan catalog (plans)
-- =============================================================================
-- Per-event one-time monetization. A `plans` row is an IMMUTABLE VERSION of a
-- tier's terms; an event pins to the version it bought (events.plan_key, added
-- in 20260618000102). To change terms you INSERT a NEW version row (e.g.
-- 'pro_v2') and flip is_current — you NEVER UPDATE a sold row's limits, or
-- you'd retroactively rewrite what existing (grandfathered) events are entitled
-- to. This separates "what we sell now" (is_current) from "what each event has"
-- (events.plan_key).
--
--   tier        logical product line ('free' | 'pro')
--   key         immutable version id ('free', 'pro', 'pro_v2', …) — the pin target
--   version     1, 2, … within a tier
--   is_current  the version checkout sells RIGHT NOW for its tier
--   name        display label ('Free' / 'Pro') — stable across versions
--
-- Numeric columns store the REAL ceilings; "Unlimited" is only a UI label the
-- client renders for the Pro tier. Idempotent / paste-runnable.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.plans (
  key                  text        NOT NULL,
  tier                 text        NOT NULL,
  version              int         NOT NULL DEFAULT 1,
  is_current           boolean     NOT NULL DEFAULT true,
  name                 text        NOT NULL,
  -- numeric caps (real ceilings; the soft cap behind "Unlimited")
  max_days             int         NOT NULL,
  max_segments_per_day int         NOT NULL,
  max_invitation_pages int         NOT NULL,
  max_guests           int         NOT NULL,
  -- cancelled guests are free up to this fraction of max_guests, then they count
  -- toward the cap (bounds the fake-cancelled loophole). A plan term, so it's
  -- versioned + grandfathered with the cap — not a global/hardcoded value.
  cancelled_grace_pct  numeric     NOT NULL DEFAULT 0.04,
  max_members          int         NOT NULL,
  -- feature flags (on/off modules) — can_* mirrors the access cols (can_create…)
  can_use_budget       boolean     NOT NULL DEFAULT false,
  can_use_gifts        boolean     NOT NULL DEFAULT false,
  can_remove_branding  boolean     NOT NULL DEFAULT false,
  -- pricing: stripe_price_id is the SKU + the webhook's verification anchor
  -- (session line-item price_id must match this); price is a display cache.
  -- Both filled once the Stripe Price objects exist (Phase E).
  stripe_price_id      text,
  price                numeric(12,2),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),  -- touched when is_current flips (version retired)

  CONSTRAINT plans_pkey     PRIMARY KEY (key),
  CONSTRAINT plans_tier_chk CHECK (tier IN ('free', 'pro'))
);

-- Exactly one current version per tier — the row checkout / create_event read.
CREATE UNIQUE INDEX IF NOT EXISTS plans_one_current_per_tier
  ON public.plans (tier) WHERE is_current;

-- RLS: world-readable catalog (a public pricing page / anon can read it). No
-- client writes — the catalog is seeded only through migrations.
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plans_select ON public.plans;
CREATE POLICY plans_select ON public.plans
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.plans TO anon, authenticated;

-- Seed v1 (free + pro). Numbers are the current spec; tweak later by adding a
-- new version row, never by editing these.
INSERT INTO public.plans (
  key,    tier,   version, is_current, name,
  max_days, max_segments_per_day, max_invitation_pages, max_guests, max_members,
  can_use_budget, can_use_gifts, can_remove_branding,
  stripe_price_id, price
)
VALUES
  ('free', 'free', 1, true, 'Free',
   1,  3,  1,  500,  3,
   false, false, false,
   NULL, NULL),               -- SKU/price set in Phase E (free = $50 activation for a 2nd+ event)
  ('pro',  'pro',  1, true, 'Pro',
   10, 30, 30, 2000, 50,
   true,  true,  true,
   NULL, NULL)                -- SKU/price set in Phase E
ON CONFLICT (key) DO NOTHING;

-- Rollback:
--   DROP TABLE public.plans;
