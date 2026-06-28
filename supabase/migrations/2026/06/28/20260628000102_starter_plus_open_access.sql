-- Migration: open Access groups to Starter + Plus
-- =============================================================================
-- Product decision: Access groups management is no longer Pro-only. Starter and
-- Plus can now view and manage access groups. Per-member access is still gated
-- by the existing resource permission (access:read / access:full in their group)
-- — this only lifts the plan-level feature gate.
-- =============================================================================

BEGIN;

UPDATE public.plans
SET can_use_access = true
WHERE key IN ('solo_1_v1', 'solo_2_v1');

COMMIT;

-- Rollback: UPDATE plans SET can_use_access = false
--           WHERE key IN ('solo_1_v1', 'solo_2_v1');
