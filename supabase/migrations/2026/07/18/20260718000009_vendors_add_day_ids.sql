-- Migration: event_vendors — add day_ids (which days a vendor is engaged for)
-- =============================================================================
-- A vendor works none / one / many days (photographer both days = ONE contact,
-- two day tags). Stored as a uuid[] of event_days ids ON THE VENDOR ROW rather
-- than a junction table: at this scale it's a plain membership set with no
-- per-pairing data, day-deletes are rare, and the app already carries uuid[]
-- membership (tasks/timeline assignees).
--
-- The tradeoff of an array — no FK to event_days — is handled two ways:
--   1) writes validate every id against the event's days (create/update_vendor),
--   2) delete_day scrubs the id from every vendor (array_remove) — the FK cascade
--      a junction table would give for free. Both land in this batch.
--
-- The RPC/DTO contract stays array-shaped (p_day_ids uuid[] in, day_ids[] out) so
-- a future swap to a junction table (only if per-day engagement DATA ever appears)
-- is storage-only and invisible to the frontend.
-- =============================================================================

ALTER TABLE public.event_vendors
  ADD COLUMN IF NOT EXISTS day_ids uuid[] NOT NULL DEFAULT '{}';

-- Rollback:
--   ALTER TABLE public.event_vendors DROP COLUMN day_ids;
