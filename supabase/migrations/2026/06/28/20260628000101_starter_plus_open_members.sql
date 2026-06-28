-- Migration: open Members to Starter + Plus with a 4-member cap
-- =============================================================================
-- Product decision: Members is no longer a Pro-only feature. Starter and Plus
-- get full team management, capped at 4 members total (root + bride + groom +
-- 1 collaborator). Pro/Advanced retain their existing higher caps.
--
-- The old can_use_members = false gate is lifted — max_members = 4 is the sole
-- enforcement. The enforce_plan_feature trigger's is_bride/is_groom exemption
-- (20260627000104) is now harmless but left as a safety net.
-- =============================================================================

BEGIN;

UPDATE public.plans
SET
  can_use_members = true,
  max_members     = 4
WHERE key IN ('solo_1_v1', 'solo_2_v1');

COMMIT;

-- Rollback: UPDATE plans SET can_use_members = false, max_members = 2
--           WHERE key IN ('solo_1_v1', 'solo_2_v1');
