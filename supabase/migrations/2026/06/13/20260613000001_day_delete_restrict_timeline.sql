-- Migration: make a day with schedule items un-deletable at the FK layer, and
-- give delete_day a clean expense guard.
-- =============================================================================
-- Mirrors the budget guard (expenses.budget_id -> bucket RESTRICT) onto the
-- timeline. Two coupled pieces:
--
--  (a) FK TRIPWIRE — event_timelines.segment_id -> event_segments flips from
--      CASCADE to RESTRICT. A day-delete cascades day -> segments, so a segment
--      that still holds items now blocks the delete on EVERY path (the app, a
--      stray DELETE, a future RPC), not just via the delete_day check. This is
--      the real guarantee; the RPC count below is only the friendly message.
--      Safe because: delete_segment reassigns items to an adjacent segment
--      before deleting (never trips), an empty day's default segment has no
--      items, and events are soft-deleted (deleted_at) so no event-level cascade
--      ever runs through this FK.
--
--  (b) delete_day GUARD — also count expenses tied to the day (via its budget
--      bucket) and raise a clean message, so the existing expenses.budget_id
--      RESTRICT surfaces as a sentence instead of a raw FK violation. Symmetric
--      with the schedule-item count already there.
-- =============================================================================

-- (a) timeline -> segment: CASCADE -> RESTRICT. -------------------------------
ALTER TABLE public.event_timelines
  DROP CONSTRAINT event_timelines_segment_id_fk,
  ADD CONSTRAINT event_timelines_segment_id_fk
    FOREIGN KEY (segment_id) REFERENCES public.event_segments (id) ON DELETE RESTRICT;

-- (b) delete_day: add the expense count guard. Re-pastes the current body
--     (20260612000002) verbatim with one extra block before the DELETE.
CREATE OR REPLACE FUNCTION public.delete_day(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count    integer;
  v_items    integer;
  v_expenses integer;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to delete days';
  END IF;

  SELECT count(*) INTO v_count FROM event_days WHERE event_id = p_event_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'An event must keep at least one day';
  END IF;

  -- Items attach via segments (event_timelines.segment_id -> event_segments
  -- .day_id). Count items, not segments — every day has a default segment.
  SELECT count(*) INTO v_items
  FROM event_timelines t
  JOIN event_segments s ON s.id = t.segment_id
  WHERE s.day_id = p_id AND t.event_id = p_event_id;
  IF v_items > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % schedule item(s) before deleting it', v_items;
  END IF;

  -- Expenses attach via the day's budget bucket (event_expenses.budget_id ->
  -- event_budget.day_id). The bucket -> expense FK is RESTRICT; count here so
  -- it reads as a message rather than a raw FK violation.
  SELECT count(*) INTO v_expenses
  FROM event_expenses e
  JOIN event_budget b ON b.id = e.budget_id
  WHERE b.day_id = p_id AND e.event_id = p_event_id;
  IF v_expenses > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % expense(s) before deleting it', v_expenses;
  END IF;

  DELETE FROM event_days WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;
END;
$$;

-- Rollback:
--   (a) ALTER TABLE public.event_timelines
--         DROP CONSTRAINT event_timelines_segment_id_fk,
--         ADD CONSTRAINT event_timelines_segment_id_fk
--           FOREIGN KEY (segment_id) REFERENCES public.event_segments (id) ON DELETE CASCADE;
--   (b) Re-run delete_day from 20260612000002 (drop the v_expenses block).
