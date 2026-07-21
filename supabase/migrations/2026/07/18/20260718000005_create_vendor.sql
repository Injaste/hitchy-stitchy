-- Migration: create_vendor — delegate access + gate on the Pro feature
-- =============================================================================
-- Two changes to the current body (20260717000001):
--   1) Access: is_super_admin(v_caller) -> has_event_permission('vendors','create').
--      Vendors is now a delegated resource (Admin=full), not couple-only.
--   2) Plan:   add assert_plan('vendors') after assert_event_writable — the Pro
--      feature gate, mirroring create_gift.
-- Everything else is re-pasted verbatim.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_vendor(
  p_event_id      uuid,
  p_name          text,
  p_category      text,
  p_phone         text DEFAULT NULL,
  p_email         text DEFAULT NULL,
  p_notes         text DEFAULT NULL
)
RETURNS event_vendors LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_row    event_vendors;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'vendors', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to add vendors';
  END IF;

  PERFORM assert_event_writable(p_event_id);
  PERFORM assert_plan(p_event_id, 'vendors');   -- NEW: vendors is a Pro feature

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'A vendor name is required';
  END IF;

  IF btrim(COALESCE(p_category, '')) = '' THEN
    RAISE EXCEPTION 'A category is required';
  END IF;

  INSERT INTO event_vendors (
    event_id, name, category, phone, email, notes
  )
  VALUES (
    p_event_id, btrim(p_name), btrim(p_category),
    p_phone, p_email, p_notes
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Rollback: re-paste create_vendor (20260717000001) — restore the
-- is_super_admin(v_caller) guard and drop the assert_plan line.
