-- Migration: rename_segment → update_segment  (naming consistency)
-- =============================================================================
-- Aligns with the update_* convention (update_timeline / update_task /
-- update_member / update_event). Drops rename_segment and adds update_segment
-- with the same signature/body. Ships with the Stage 2 client that calls it.
-- =============================================================================

DROP FUNCTION IF EXISTS public.rename_segment(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.update_segment(p_event_id uuid, p_id uuid, p_name text)
RETURNS event_segments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_seg event_segments;
BEGIN
  IF NOT has_event_permission(p_event_id, 'timeline', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update segments';
  END IF;

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
