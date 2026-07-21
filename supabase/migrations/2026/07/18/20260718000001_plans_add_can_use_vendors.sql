-- Migration: plans — add can_use_vendors (vendors becomes a Pro feature)
-- =============================================================================
-- Vendors joins the Pro-and-up feature set (like budget/gifts). One boolean flag,
-- read by plan_within_limits('vendors') / assert_plan / the bootstrap features
-- map. No count cap — vendors is feature-gated only (the couple's directory is
-- small; a per-tier ceiling would be noise). Starter/Plus stay locked (default
-- false); Pro + Advanced unlock it.
--
-- Additive: a new column with a safe default, then seed the two paid tiers. The
-- catalog is versioned + pinned, but this is an ADDITION (a feature that didn't
-- exist gets granted to existing Pro/Advanced events) — the same shape every
-- prior tiered-entitlement migration used (max_tasks, max_timeline_items).
-- =============================================================================

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS can_use_vendors boolean NOT NULL DEFAULT false;

UPDATE public.plans SET can_use_vendors = true WHERE key = 'solo_3_v1'; -- Pro
UPDATE public.plans SET can_use_vendors = true WHERE key = 'solo_4_v1'; -- Advanced

-- Rollback:
--   ALTER TABLE public.plans DROP COLUMN can_use_vendors;
