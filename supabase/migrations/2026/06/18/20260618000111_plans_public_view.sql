-- Migration: Subscription plans (111) — stop the plans table leaking secrets
-- =============================================================================
-- plans was world-readable with ALL columns (101). RLS gates ROWS, not COLUMNS,
-- so cancelled_grace_pct (internal anti-abuse) and stripe_price_id (Stripe SKU)
-- were readable by anyone via from('plans').select('*') — which is why hiding
-- grace in the bootstrap (110) wasn't enough. The table read was the real hole.
--
-- Fix (data-access.md masking-view pattern): revoke the broad table read, and
-- expose a curated plans_public VIEW with only safe, user-facing columns. The
-- view runs with its owner's rights, so grantees see those columns and never the
-- underlying table. SECURITY DEFINER functions (get_bootstrap_context,
-- plan_allows, …) read plans directly server-side and are unaffected.
-- =============================================================================

-- 1) Close the table leak — clients can no longer read plans rows at all.
DROP POLICY IF EXISTS plans_select ON public.plans;
REVOKE SELECT ON public.plans FROM anon, authenticated;

-- 2) Safe public projection (current versions only) for a future pricing page.
--    Excludes cancelled_grace_pct + stripe_price_id (+ internal timestamps).
CREATE OR REPLACE VIEW public.plans_public AS
  SELECT key, tier, name, version,
         max_days, max_segments_per_day, max_invitation_pages, max_guests, max_members,
         can_use_budget, can_use_gifts, can_remove_branding,
         price
  FROM public.plans
  WHERE is_current;

GRANT SELECT ON public.plans_public TO anon, authenticated;

-- Rollback:
--   DROP VIEW public.plans_public;
--   GRANT SELECT ON public.plans TO anon, authenticated;
--   CREATE POLICY plans_select ON public.plans FOR SELECT TO anon, authenticated USING (true);
