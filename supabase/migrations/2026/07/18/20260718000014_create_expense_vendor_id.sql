-- Migration: create_expense — accept vendor_id (link to a CRM vendor)
-- =============================================================================
-- Re-pastes the current body (20260630000102) verbatim + a p_vendor_id uuid param
-- at the END (backward-safe). When set, the vendor must belong to this event.
-- vendor_name is untouched — the FE snapshots the picked vendor's name into it so
-- the label survives a vendor delete (ON DELETE SET NULL nulls vendor_id only).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_expense(
  p_event_id    uuid,
  p_item        text,
  p_vendor_name text    DEFAULT NULL,
  p_payer       text    DEFAULT NULL,
  p_amount      numeric DEFAULT 0,
  p_paid        numeric DEFAULT 0,
  p_due_at      date    DEFAULT NULL,
  p_notes       text    DEFAULT NULL,
  p_day_id      uuid    DEFAULT NULL,
  p_vendor_id   uuid    DEFAULT NULL
)
RETURNS event_expenses LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller    event_members;
  v_budget_id uuid;
  v_row       event_expenses;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to create expenses';
  END IF;

  IF btrim(COALESCE(p_item, '')) = '' THEN
    RAISE EXCEPTION 'Item is required';
  END IF;

  IF COALESCE(p_amount, 0) < 0 OR COALESCE(p_paid, 0) < 0 THEN
    RAISE EXCEPTION 'Amounts or paid cannot be negative';
  END IF;

  IF COALESCE(p_paid, 0) > COALESCE(p_amount, 0) THEN
    RAISE EXCEPTION 'Paid cannot exceed the amount';
  END IF;

  IF p_vendor_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM event_vendors WHERE id = p_vendor_id AND event_id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Vendor does not belong to this event';
  END IF;

  v_budget_id := get_or_create_budget_bucket(p_event_id, p_day_id);
  PERFORM assert_plan(p_event_id, 'expenses');   -- per-event expense ceiling

  INSERT INTO event_expenses (
    event_id, budget_id, item, vendor_name, vendor_id, payer, amount, paid, due_at, notes
  )
  VALUES (
    p_event_id, v_budget_id, btrim(p_item), p_vendor_name, p_vendor_id, p_payer,
    COALESCE(p_amount, 0), COALESCE(p_paid, 0), p_due_at, p_notes
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Rollback: re-paste create_expense (20260630000102) — drop the p_vendor_id param,
-- its validation, and vendor_id from the INSERT.
