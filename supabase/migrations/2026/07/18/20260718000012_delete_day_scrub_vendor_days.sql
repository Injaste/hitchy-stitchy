-- Migration: delete_day — scrub the deleted day from vendors' day_ids
-- =============================================================================
-- Re-pastes the current body (20260617000002) verbatim + one UPDATE: strip the
-- deleted day's id out of every vendor's day_ids array. This is the FK cascade an
-- event_vendor_days junction table would give for free — the price of the array.
--
-- Note the asymmetry: timeline items / expenses / gifts / invitations BLOCK the
-- delete (owned data that would be orphaned). A vendor day-tag is NOT owned data
-- — just a membership flag — so it's scrubbed, not blocked (same treatment the
-- access-group collapse gave dropped ids in timeline assignees).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.delete_day(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count       integer;
  v_items       integer;
  v_expenses    integer;
  v_gifts       integer;
  v_invitations integer;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to delete days';
  END IF;

  SELECT count(*) INTO v_count FROM event_days WHERE event_id = p_event_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'An event must keep at least one day';
  END IF;

  SELECT count(*) INTO v_items
  FROM event_timelines t
  JOIN event_segments s ON s.id = t.segment_id
  WHERE s.day_id = p_id AND t.event_id = p_event_id;
  IF v_items > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % schedule item(s) before deleting it', v_items;
  END IF;

  SELECT count(*) INTO v_expenses
  FROM event_expenses e
  JOIN event_budget b ON b.id = e.budget_id
  WHERE b.day_id = p_id AND e.event_id = p_event_id;
  IF v_expenses > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % expense(s) before deleting it', v_expenses;
  END IF;

  SELECT count(*) INTO v_gifts
  FROM event_gifts WHERE day_id = p_id AND event_id = p_event_id;
  IF v_gifts > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % gift(s) before deleting it', v_gifts;
  END IF;

  -- Invitations attach via event_invitations.day_id (RESTRICT FK). Count here so
  -- it reads as a message rather than a raw FK violation.
  SELECT count(*) INTO v_invitations
  FROM event_invitations WHERE day_id = p_id AND event_id = p_event_id;
  IF v_invitations > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % invitation(s) before deleting it', v_invitations;
  END IF;

  -- Vendor day-tags aren't owned data — scrub, don't block (see header). NEW.
  UPDATE event_vendors
  SET day_ids = array_remove(day_ids, p_id)
  WHERE event_id = p_event_id AND p_id = ANY(day_ids);

  DELETE FROM event_days WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;
END;
$$;

-- Rollback: re-paste delete_day (20260617000002) WITHOUT the event_vendors scrub.
