-- Migration: update_vendor — accept day_ids (replace the vendor's day set)
-- =============================================================================
-- Re-pastes the current body (20260718000006) verbatim + a p_day_ids uuid[] param
-- at the END. Same dedupe + validate as create_vendor; the UPDATE replaces the
-- whole set (the form always sends the full selection).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_vendor(
  p_event_id      uuid,
  p_id            uuid,
  p_name          text,
  p_category      text,
  p_phone         text DEFAULT NULL,
  p_email         text DEFAULT NULL,
  p_notes         text DEFAULT NULL,
  p_day_ids       uuid[] DEFAULT '{}'
)
RETURNS event_vendors LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller  event_members;
  v_row     event_vendors;
  v_day_ids uuid[];
BEGIN
  SELECT * INTO v_row FROM event_vendors WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vendor not found';
  END IF;

  IF v_row.event_id != p_event_id THEN
    RAISE EXCEPTION 'Vendor does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'vendors', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update vendors';
  END IF;

  PERFORM assert_event_writable(p_event_id);
  PERFORM assert_plan(p_event_id, 'vendors');

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'A vendor name is required';
  END IF;

  IF btrim(COALESCE(p_category, '')) = '' THEN
    RAISE EXCEPTION 'A category is required';
  END IF;

  -- Dedupe + validate the day tags: every id must be a day of this event.
  v_day_ids := ARRAY(SELECT DISTINCT d FROM unnest(COALESCE(p_day_ids, '{}'::uuid[])) AS d);
  IF EXISTS (
    SELECT 1 FROM unnest(v_day_ids) AS d
    WHERE NOT EXISTS (SELECT 1 FROM event_days WHERE id = d AND event_id = p_event_id)
  ) THEN
    RAISE EXCEPTION 'A selected day does not belong to this event';
  END IF;

  UPDATE event_vendors
  SET
    name          = btrim(p_name),
    category      = btrim(p_category),
    phone         = p_phone,
    email         = p_email,
    notes         = p_notes,
    day_ids       = v_day_ids
  WHERE id = p_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Rollback: re-paste update_vendor (20260718000006) — drop the p_day_ids param,
-- the v_day_ids validation, and day_ids from the UPDATE.
