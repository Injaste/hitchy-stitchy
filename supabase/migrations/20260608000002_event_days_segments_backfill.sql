-- Migration: event_days + event_segments spine — 2/3 BACKFILL  (Phase 0, Stage 1)
-- =============================================================================
-- Run AFTER 20260608000001_event_days_segments_tables.sql.
-- One-time data backfill for existing events. Safe to re-run (idempotent):
-- conflicts are ignored and only NULL segment_ids are filled. Step 4d is re-run
-- verbatim at the start of Stage 2 to catch items created in the interim.
-- =============================================================================

-- 4a) One day per calendar date in every event's range.
INSERT INTO public.event_days (event_id, date)
SELECT e.id, gs::date
FROM public.events e
CROSS JOIN LATERAL
  generate_series(e.date_start, e.date_end, interval '1 day') AS gs
ON CONFLICT (event_id, date) DO NOTHING;

-- 4b) Cover any timeline item whose `day` falls outside its event's range
--     (the client unions out-of-range item days, so such rows can exist).
INSERT INTO public.event_days (event_id, date)
SELECT DISTINCT t.event_id, t.day
FROM public.event_timelines t
ON CONFLICT (event_id, date) DO NOTHING;

-- 4c) One default segment per day.
INSERT INTO public.event_segments (event_id, day_id, name, sort_order)
SELECT ed.event_id, ed.id, NULL, 0
FROM public.event_days ed
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_segments es
  WHERE es.day_id = ed.id AND es.name IS NULL
);

-- 4d) Point every existing timeline item at its day's default segment.
UPDATE public.event_timelines t
SET segment_id = es.id
FROM public.event_days ed
JOIN public.event_segments es
  ON es.day_id = ed.id AND es.name IS NULL
WHERE ed.event_id = t.event_id
  AND ed.date     = t.day
  AND t.segment_id IS NULL;


-- =============================================================================
-- Verification — run these right after; each should return 0 / no rows.
-- =============================================================================
-- Every existing timeline item is mapped to a segment:
--   SELECT count(*) FROM event_timelines WHERE segment_id IS NULL;
-- Every event has at least one day:
--   SELECT e.id FROM events e
--   LEFT JOIN event_days d ON d.event_id = e.id WHERE d.id IS NULL;
-- Every day has a default segment:
--   SELECT d.id FROM event_days d
--   LEFT JOIN event_segments s ON s.day_id = d.id AND s.name IS NULL
--   WHERE s.id IS NULL;
