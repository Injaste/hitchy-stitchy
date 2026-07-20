-- Migration: update_expense — drop the p_vendor_name param
-- =============================================================================
-- Pairs with 20260720000001; see that file for why vendor_name is going. The old
-- signature is dropped first so the shortened one doesn't linger as an overload.
-- =============================================================================
DROP FUNCTION IF EXISTS public.update_expense(
  uuid, uuid, text, text, text, numeric, numeric, date, text, uuid, uuid
);

CREATE OR REPLACE FUNCTION public.update_expense(
  p_event_id  uuid,
  p_id        uuid,
  p_item      text    DEFAULT NULL,
  p_payer     text    DEFAULT NULL,
  p_amount    numeric DEFAULT NULL,
  p_paid      numeric DEFAULT NULL,
  p_due_at    date    DEFAULT NULL,
  p_notes     text    DEFAULT NULL,
  p_day_id    uuid    DEFAULT NULL,
  p_vendor_id uuid    DEFAULT NULL
)
RETURNS event_expenses LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller    event_members;
  v_expense   event_expenses;
  v_budget_id uuid;
  v_amount    numeric;
  v_paid      numeric;
BEGIN
  SELECT * INTO v_expense FROM event_expenses WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  IF v_expense.event_id != p_event_id THEN
    RAISE EXCEPTION 'Expense does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to update expenses';
  END IF;

  v_amount := COALESCE(p_amount, v_expense.amount);
  v_paid   := COALESCE(p_paid, v_expense.paid);

  IF v_amount < 0 OR v_paid < 0 THEN
    RAISE EXCEPTION 'Amounts or paid cannot be negative';
  END IF;

  IF v_paid > v_amount THEN
    RAISE EXCEPTION 'Paid cannot exceed the amount';
  END IF;

  IF p_vendor_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM event_vendors WHERE id = p_vendor_id AND event_id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Vendor does not belong to this event';
  END IF;

  v_budget_id := get_or_create_budget_bucket(p_event_id, p_day_id);

  UPDATE event_expenses
  SET
    budget_id = v_budget_id,
    item      = COALESCE(NULLIF(btrim(p_item), ''), item),
    vendor_id = p_vendor_id,
    payer     = p_payer,
    amount    = v_amount,
    paid      = v_paid,
    due_at    = p_due_at,
    notes     = p_notes
  WHERE id = p_id
  RETURNING * INTO v_expense;

  RETURN v_expense;
END;
$$;

-- Rollback: re-paste update_expense (20260718000015) — restores p_vendor_name in
-- position 4 and vendor_name in the UPDATE. Requires the column back first.
