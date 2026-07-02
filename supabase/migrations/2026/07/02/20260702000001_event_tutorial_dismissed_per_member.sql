-- event_tutorial: make DISMISSAL per-member instead of a shared event flag. Guide
-- COMPLETION stays event-wide (derived from real data + viewed_steps) — but "hide the
-- guide" is a personal preference: within a couple one partner may be done and dismiss
-- it while the other still wants it. So the single `dismissed boolean` becomes
-- `dismissed_by` — a jsonb array of the event_members.id values that have dismissed it.
-- A member sees the guide unless their id is in the array. Kept on the same
-- event-scoped row (no per-member rows) so the shared completion data stays in one place.
--
-- The old boolean can't be migrated meaningfully — an event-wide flag doesn't record
-- WHICH member dismissed it — so we drop it. Any previously-dismissed guide simply
-- reappears once, which is fine for onboarding state.
--
-- RLS is unchanged: is_super_admin_member already lets either partner read & write the
-- row, and each writes only their own id into the array.

ALTER TABLE public.event_tutorial
  DROP COLUMN IF EXISTS dismissed,
  ADD COLUMN IF NOT EXISTS dismissed_by jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Rollback:
--   ALTER TABLE public.event_tutorial
--     DROP COLUMN IF EXISTS dismissed_by,
--     ADD COLUMN dismissed boolean NOT NULL DEFAULT false;
