-- Migration: Subscription plans (108) — over-limit lock on day/segment renames
-- =============================================================================
-- update_day / update_segment grow nothing (just rename), so they take only the
-- whole-event lock — assert_event_writable (paid/active AND not over plan
-- limits). A pending or over-limit event can't be edited until paid / trimmed;
-- delete_day / delete_segment stay open as the escape hatch.
--
-- NOTE: budget/gift updates are already locked via migration 107 (their writes
-- funnel through gated paths). A fuller sweep of the remaining update_* RPCs
-- (tasks, timeline, …) for complete downgrade-lock coverage is a follow-up —
-- it's downgrade polish, not part of the core payment slice.
-- Bodies re-pasted verbatim; the single PERFORM line is the only addition.
-- =============================================================================

-- ── update_day ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_day(p_event_id uuid, p_id uuid, p_label text)
RETURNS event_days LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day event_days;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to update days';
  END IF;

  PERFORM assert_event_writable(p_event_id);   -- NEW

  IF btrim(COALESCE(p_label, '')) = '' THEN
    RAISE EXCEPTION 'A label is required';
  END IF;

  UPDATE event_days
  SET label = btrim(p_label)
  WHERE id = p_id AND event_id = p_event_id
  RETURNING * INTO v_day;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;

  RETURN v_day;
END;
$$;

-- ── update_segment ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_segment(p_event_id uuid, p_id uuid, p_name text)
RETURNS event_segments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg event_segments;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update segments';
  END IF;

  PERFORM assert_event_writable(p_event_id);   -- NEW

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'Segment name is required';
  END IF;

  UPDATE event_segments
  SET name = btrim(p_name)
  WHERE id = p_id AND event_id = p_event_id
  RETURNING * INTO v_seg;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Segment not found';
  END IF;

  RETURN v_seg;
END;
$$;

-- Rollback: re-paste the pre-gate bodies (drop the PERFORM line from each).
