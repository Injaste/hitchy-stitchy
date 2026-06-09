-- Migration: timeline writes — CLEANUP, drop the day-based overloads  (Stage 2)
-- =============================================================================
-- ⚠️ Run ONLY after the new (segment-based) client is fully deployed and the old
-- client retired. This removes the day-based create_timeline / update_timeline
-- overloads that the old client used. After this, any stale cached old client
-- that still sends p_day will fail on create/update — which is the intended
-- cutover point.
--
-- `event_timelines.day` is intentionally KEPT: the client still derives item
-- date/time from it (scheduledStartDate etc.). Dropping `day` entirely is a
-- separate, later step that also requires reworking the client's date math —
-- not done here.
-- =============================================================================

-- Final heal: any items the old client created before cutover (NULL segment_id).
UPDATE public.event_timelines t
SET segment_id = es.id
FROM public.event_days ed
JOIN public.event_segments es ON es.day_id = ed.id AND es.name IS NULL
WHERE ed.event_id = t.event_id
  AND ed.date     = t.day
  AND t.segment_id IS NULL;

-- Drop the day-based overloads (the old client's signatures).
DROP FUNCTION IF EXISTS public.create_timeline(
  uuid, date, text, time without time zone, time without time zone, text, text, uuid[]
);
DROP FUNCTION IF EXISTS public.update_timeline(
  uuid, uuid, date, text, time without time zone, time without time zone, text, text, uuid[]
);

-- Optional, once every item is guaranteed to have a segment:
--   ALTER TABLE public.event_timelines ALTER COLUMN segment_id SET NOT NULL;
