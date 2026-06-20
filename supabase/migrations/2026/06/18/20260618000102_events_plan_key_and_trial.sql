-- Migration: Subscription plans (102) — events.plan_key + activation + profiles
-- =============================================================================
-- Pins each event to a plan VERSION (events.plan_key → plans.key), adds the
-- per-event activation flag, and the generic per-account `profiles` table.
-- (The 7-day Pro trial that first used profiles was removed; the table stays as
-- the account-state home — see its note below.)
--
-- Grandfathering: all existing events pin to 'pro' (the current Pro version) —
-- verified 2026-06-18 that no current event exceeds the Pro caps, so the new
-- over-limit edit-lock can't fire on them. They keep 'pro' forever even after a
-- future 'pro_v2' ships (the pin grandfathers them). New events default 'free'.
--
-- Activation (events.activated_at): TIER (free/pro) and PRICE are separate axes.
-- Each account gets ONE free-tier event at no cost (the "allowance"); every
-- additional event is paid even at the Free tier. activated_at NULL = pending
-- payment (locked like over-limit). The allowance event + all paid events are
-- active; a 2nd+ unpaid event is created NULL and activated by its Stripe
-- webhook. Default now() so existing + transitional events stay active;
-- create_event sets NULL for non-entitled new events (wired in 20260618000105).
--
-- Additive; idempotent. Run AFTER 20260618000101.
-- =============================================================================

-- ── events.plan_key (pinned version) ────────────────────────────────────────
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS plan_key text;

-- Default first, so any event the live app inserts mid-run gets 'free' (never
-- NULL) and the SET NOT NULL below can't trip.
ALTER TABLE public.events ALTER COLUMN plan_key SET DEFAULT 'free';

-- Grandfather every PRE-EXISTING event (those added before the default → NULL)
-- to 'pro'. New 'free' rows from the gap are correctly left alone.
UPDATE public.events SET plan_key = 'pro' WHERE plan_key IS NULL;

ALTER TABLE public.events ALTER COLUMN plan_key SET NOT NULL;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_plan_key_fk;
ALTER TABLE public.events
  ADD CONSTRAINT events_plan_key_fk
    FOREIGN KEY (plan_key) REFERENCES public.plans (key);

-- ── events.activated_at (entitlement / payment activation) ──────────────────
-- NULL = pending payment (locked). Default now() backfills existing + covers
-- transitional inserts so the live app keeps working; create_event later sets
-- NULL explicitly for a non-entitled new event.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS activated_at timestamptz DEFAULT now();

-- ── profiles (generic per-account state) ────────────────────────────────────
-- One row per auth user (id = auth.users.id). The home for ACCOUNT-level state
-- (a future planner subscription, account prefs, …) — extend with columns, not
-- new single-purpose tables. trial_ends_at is currently DORMANT: the 7-day Pro
-- trial was removed, but the column/table are kept so re-adding it is logic-only
-- (re-wire effective_plan_key + a create_event seed). Nothing writes rows today.
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid        NOT NULL,            -- = auth.users.id
  trial_ends_at timestamptz,                     -- DORMANT (trial removed)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- RLS: an account reads only its own profile. Writes go through SECURITY DEFINER
-- RPCs, so there is no write policy yet.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Rollback:
--   DROP TABLE public.profiles;
--   ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_plan_key_fk;
--   ALTER TABLE public.events DROP COLUMN IF EXISTS plan_key, DROP COLUMN IF EXISTS activated_at;
