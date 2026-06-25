-- Migration: Entry tier → "Starter" launch limits — pre-launch correction
-- =============================================================================
-- Sets the entry tier to its launch spec and renames its DISPLAY label to
-- "Starter". The tier KEY stays 'free' on purpose: free_event_available() and the
-- $0-allowance / activation logic key off plan_key = 'free', so the key is
-- load-bearing and must not move — only plans.name (the user-facing label) changes.
--
-- In-place UPDATE (not a new version row) is deliberate: this is PRE-LAUNCH — no
-- plan has been sold, so there are no grandfathered entitlements to protect, and
-- existing dev events on 'free' should pick up the launch limits. Once Starter is
-- live and sold, change its terms the versioned way (INSERT a new key, flip
-- is_current) per 20260618000101 — never UPDATE a sold row again.
--
-- The 'pro' (and any higher) catalog rows are intentionally LEFT AS-IS; paid
-- tiers are simply hidden on the frontend (PLAN_TIERS) until each is built.
--
-- Spec: 50 guests · 1 day · 1 segment/day · 1 invitation page · 2 members ·
-- no budget/gifts/branding · S$50 activation fee for a 2nd+ event.
-- Idempotent / paste-runnable.
-- =============================================================================

UPDATE public.plans
SET name                 = 'Starter',
    max_days             = 1,
    max_segments_per_day = 1,
    max_invitation_pages = 1,
    max_guests           = 50,
    max_members          = 2,
    can_use_budget       = false,
    can_use_gifts        = false,
    can_remove_branding  = false,
    price                = 50,
    updated_at           = now()
WHERE key = 'free';

-- Rollback (restore the original v1 seed values):
--   UPDATE public.plans
--   SET name = 'Free', max_days = 1, max_segments_per_day = 3,
--       max_invitation_pages = 1, max_guests = 500, max_members = 3,
--       price = NULL, updated_at = now()
--   WHERE key = 'free';
