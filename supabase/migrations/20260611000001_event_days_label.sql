-- Migration: event_days.label — give each event day a REQUIRED human label.
-- =============================================================================
-- A day's date is its identity; the label ("Mehndi Night", "Nikah & Reception",
-- "Walimah") is what makes a spread-out wedding week legible across the app.
-- Required (NOT NULL) — every day must be named. Legacy days from the old
-- contiguous-range backfill have no label, so they're backfilled with a
-- positional "Day N" (by date order) BEFORE the NOT NULL is set.
-- Idempotent: ADD/UPDATE/SET NOT NULL are all no-ops on a second run.
-- =============================================================================

ALTER TABLE public.event_days
  ADD COLUMN IF NOT EXISTS label text;

-- Backfill any legacy unlabeled days with a positional default (by date order
-- within each event), numbering across ALL of the event's days.
UPDATE public.event_days ed
SET label = 'Day ' || sub.n
FROM (
  SELECT id, row_number() OVER (PARTITION BY event_id ORDER BY date) AS n
  FROM public.event_days
) sub
WHERE ed.id = sub.id AND ed.label IS NULL;

ALTER TABLE public.event_days
  ALTER COLUMN label SET NOT NULL;

-- Rollback:
-- ALTER TABLE public.event_days ALTER COLUMN label DROP NOT NULL;
-- ALTER TABLE public.event_days DROP COLUMN label;
