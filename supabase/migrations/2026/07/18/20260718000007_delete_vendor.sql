-- Migration: delete_vendor — delegate access (no plan gate)
-- =============================================================================
-- One change to the current body (20260717000001): the access guard
-- is_super_admin -> has_event_permission('vendors','delete'). NO assert_plan and
-- NO assert_event_writable — deletes stay cleanable on a downgraded/over-limit
-- event, the rule 20260618000107 set for budget/gift deletes. Otherwise verbatim.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.delete_vendor(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
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

  IF NOT has_event_permission(p_event_id, 'vendors', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to remove vendors';
  END IF;

  -- No assert_event_writable — see the note above: deletes stay cleanable.
  DELETE FROM event_vendors WHERE id = p_id;
END;
$$;

-- Rollback: re-paste delete_vendor (20260717000001) — restore the
-- is_super_admin(v_caller) guard.
