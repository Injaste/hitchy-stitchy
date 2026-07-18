-- Migration: update_vendor — delegate access + gate on the Pro feature
-- =============================================================================
-- Same two changes as create_vendor, applied to the current body
-- (20260717000001): access guard is_super_admin -> has_event_permission
-- ('vendors','update'), and a Pro feature gate assert_plan('vendors') after
-- assert_event_writable (mirroring update_gift). Everything else verbatim.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_vendor(
  p_event_id      uuid,
  p_id            uuid,
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
  PERFORM assert_plan(p_event_id, 'vendors');   -- NEW: vendors is a Pro feature

  IF btrim(COALESCE(p_name, '')) = '' THEN
    RAISE EXCEPTION 'A vendor name is required';
  END IF;

  IF btrim(COALESCE(p_category, '')) = '' THEN
    RAISE EXCEPTION 'A category is required';
  END IF;

  UPDATE event_vendors
  SET
    name          = btrim(p_name),
    category      = btrim(p_category),
    phone         = p_phone,
    email         = p_email,
    notes         = p_notes
  WHERE id = p_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Rollback: re-paste update_vendor (20260717000001) — restore the
-- is_super_admin(v_caller) guard and drop the assert_plan line.
