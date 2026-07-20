-- Migration: create_expense — drop the p_vendor_name param
-- =============================================================================
-- vendor_name is being removed (see 20260720000003). It was a snapshot of the
-- picked vendor's name, kept so an expense still showed a label after its vendor
-- was deleted (ON DELETE SET NULL nulls vendor_id only). Two things killed it:
-- the field is now a hard vendor_id dropdown with no free-text, so there is no
-- placeholder left to hold; and the snapshot was written at SAVE time but only
-- ever read at DELETE time, so a rename in between made the one label it exists
-- to produce the stale one. The delete modal now states the impact instead.
--
-- Removing a param makes a NEW overload, so the old signature is dropped first —
-- otherwise both persist and PostgREST can't choose a candidate.
-- =============================================================================
DROP FUNCTION IF EXISTS public.create_expense(
  uuid, text, text, text, numeric, numeric, date, text, uuid, uuid
);

CREATE OR REPLACE FUNCTION public.create_expense(
  p_event_id  uuid,
  p_item      text,
  p_payer     text    DEFAULT NULL,
  p_amount    numeric DEFAULT 0,
  p_paid      numeric DEFAULT 0,
  p_due_at    date    DEFAULT NULL,
  p_notes     text    DEFAULT NULL,
  p_day_id    uuid    DEFAULT NULL,
  p_vendor_id uuid    DEFAULT NULL
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
    event_id, budget_id, item, vendor_id, payer, amount, paid, due_at, notes
  )
  VALUES (
    p_event_id, v_budget_id, btrim(p_item), p_vendor_id, p_payer,
    COALESCE(p_amount, 0), COALESCE(p_paid, 0), p_due_at, p_notes
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Rollback: re-paste create_expense (20260718000014) — restores p_vendor_name in
-- position 3 and vendor_name in the INSERT. Requires the column back first.
