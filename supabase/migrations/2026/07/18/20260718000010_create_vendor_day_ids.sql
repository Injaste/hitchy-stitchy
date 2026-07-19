-- Migration: create_vendor — accept day_ids (which days the vendor works)
-- =============================================================================
-- Re-pastes the current body (20260718000005) verbatim + a p_day_ids uuid[] param
-- at the END (backward-safe: existing named-arg calls keep working). The ids are
-- deduped and validated against THIS event's days before write — the array's
-- stand-in for the FK a junction table would enforce.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_vendor(
  p_event_id      uuid,
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
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'vendors', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to add vendors';
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

  INSERT INTO event_vendors (
    event_id, name, category, phone, email, notes, day_ids
  )
  VALUES (
    p_event_id, btrim(p_name), btrim(p_category),
    p_phone, p_email, p_notes, v_day_ids
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Rollback: re-paste create_vendor (20260718000005) — drop the p_day_ids param,
-- the v_day_ids validation, and day_ids from the INSERT.
