-- Drop created_by from event_expenses.
-- Super-admin-only table — creator is always the couple; field is never read by the FE.
-- Same rationale as 20260613000004_drop_gift_created_by.
-- =============================================================================

-- 1) Drop column (CASCADE drops event_expenses_created_by_fk automatically).
ALTER TABLE public.event_expenses DROP COLUMN IF EXISTS created_by;

-- 2) Drop the old create_expense (its INSERT still references created_by).
DROP FUNCTION public.create_expense(uuid, text, text, text, numeric, numeric, date, text, uuid);

-- 3) Recreate create_expense without the created_by INSERT.
--    v_caller is kept — still needed for the is_super_admin check.
CREATE FUNCTION public.create_expense(
  p_event_id    uuid,
  p_item        text,
  p_vendor_name text    DEFAULT NULL,
  p_payer       text    DEFAULT NULL,
  p_amount      numeric DEFAULT 0,
  p_paid        numeric DEFAULT 0,
  p_due_at      date    DEFAULT NULL,
  p_notes       text    DEFAULT NULL,
  p_day_id      uuid    DEFAULT NULL
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

  v_budget_id := get_or_create_budget_bucket(p_event_id, p_day_id);

  INSERT INTO event_expenses (
    event_id, budget_id, item, vendor_name, payer, amount, paid, due_at, notes
  )
  VALUES (
    p_event_id, v_budget_id, btrim(p_item), p_vendor_name, p_payer,
    COALESCE(p_amount, 0), COALESCE(p_paid, 0), p_due_at, p_notes
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Rollback:
--   DROP FUNCTION public.create_expense(uuid, text, text, text, numeric, numeric, date, text, uuid);
--   <restore original create_expense from 20260612000101_budget_per_day_super_admin.sql>
--   ALTER TABLE public.event_expenses ADD COLUMN created_by uuid
--     REFERENCES public.event_members (id) ON DELETE SET NULL;
