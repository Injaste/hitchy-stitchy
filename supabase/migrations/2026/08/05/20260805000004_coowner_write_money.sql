-- Migration: Co-owner writes money — budget/gifts upgraded to :full
-- =============================================================================
-- Phase 1b of money delegation (writes). Completes what 1a (20260805000003)
-- started: the Co-owner group's budget/gifts grant goes read -> full, and every
-- money WRITE RPC swaps its bespoke `is_super_admin` guard for the canonical
-- has_event_permission(..., 'full') check. Owner still passes via the
-- superadmin bypass inside has_event_permission; Helper has no budget/gifts key
-- -> denied, same as before.
--
-- Bodies below are re-pastes of the current schema.sql definitions (confirmed
-- current — not drifted — against each function's newest migration:
-- create/update/delete_expense = 20260720000001/2 + 20260618000107 gate;
-- update_budget = 20260618000107; create/update/delete_gift = 20260630000102 +
-- 20260618000107). The ONLY change in each is the guard line.
--
-- delete_expense / delete_gift were deliberately left ungated by the original
-- plan-gate migration (20260618000107) so a dormant/downgraded event stays
-- cleanable. They keep that property here — swapping to has_event_permission
-- changes WHO may delete (Owner+Co-owner instead of Owner-only), not WHETHER a
-- plan gate applies (still none).
-- =============================================================================

-- 1. Upgrade the Co-owner grant: budget/gifts read -> full.
UPDATE event_access_groups
SET permissions = permissions || '{"budget":"full","gifts":"full"}'::jsonb
WHERE code = 'admin';

-- 2. create_expense
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

  IF NOT has_event_permission(p_event_id, 'budget', 'full') THEN
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
  PERFORM assert_plan(p_event_id, 'expenses');   -- per-event expense ceiling [20260630000102]

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

-- 3. update_expense
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

  IF NOT has_event_permission(p_event_id, 'budget', 'full') THEN
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
    budget_id   = v_budget_id,
    item        = COALESCE(NULLIF(btrim(p_item), ''), item),
    vendor_id   = p_vendor_id,
    payer       = p_payer,
    amount      = v_amount,
    paid        = v_paid,
    due_at      = p_due_at,
    notes       = p_notes
  WHERE id = p_id
  RETURNING * INTO v_expense;

  RETURN v_expense;
END;
$$;

-- 4. delete_expense
CREATE OR REPLACE FUNCTION public.delete_expense(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller  event_members;
  v_expense event_expenses;
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

  IF NOT has_event_permission(p_event_id, 'budget', 'full') THEN
    RAISE EXCEPTION 'Insufficient permission to delete expenses';
  END IF;

  DELETE FROM event_expenses WHERE id = p_id;
END;
$$;

-- 5. update_budget
CREATE OR REPLACE FUNCTION public.update_budget(p_event_id uuid, p_amount numeric, p_day_id uuid DEFAULT NULL)
RETURNS event_budget LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller    event_members;
  v_budget_id uuid;
  v_row       event_budget;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'budget', 'full') THEN
    RAISE EXCEPTION 'Insufficient permission to update the budget';
  END IF;

  IF p_amount IS NOT NULL AND p_amount < 0 THEN
    RAISE EXCEPTION 'Budget cannot be negative';
  END IF;

  v_budget_id := get_or_create_budget_bucket(p_event_id, p_day_id);

  UPDATE event_budget
  SET budget_total = p_amount
  WHERE id = v_budget_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- 6. create_gift
CREATE OR REPLACE FUNCTION public.create_gift(
  p_event_id uuid,
  p_given_by text,
  p_amount   numeric DEFAULT 0,
  p_method   text    DEFAULT 'envelope',
  p_notes    text    DEFAULT NULL,
  p_day_id   uuid    DEFAULT NULL
)
RETURNS event_gifts LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_day    uuid;
  v_row    event_gifts;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'gifts', 'full') THEN
    RAISE EXCEPTION 'Insufficient permission to record gifts';
  END IF;

  PERFORM assert_event_writable(p_event_id);
  PERFORM assert_plan(p_event_id, 'gifts');           -- feature gate (first)
  PERFORM assert_plan(p_event_id, 'gift_envelopes');  -- per-event gift ceiling [20260630000102]

  IF btrim(COALESCE(p_given_by, '')) = '' THEN
    RAISE EXCEPTION 'A giver name is required';
  END IF;

  IF COALESCE(p_amount, 0) < 0 THEN
    RAISE EXCEPTION 'Amount cannot be negative';
  END IF;

  -- Resolve the day: explicit pick, else the event's earliest day.
  v_day := COALESCE(
    p_day_id,
    (SELECT id FROM event_days WHERE event_id = p_event_id ORDER BY date, id LIMIT 1)
  );
  IF v_day IS NULL THEN
    RAISE EXCEPTION 'Event has no days';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM event_days WHERE id = v_day AND event_id = p_event_id) THEN
    RAISE EXCEPTION 'Day does not belong to this event';
  END IF;

  INSERT INTO event_gifts (event_id, given_by, amount, method, notes, day_id)
  VALUES (
    p_event_id, btrim(p_given_by), COALESCE(p_amount, 0),
    COALESCE(p_method, 'envelope'), p_notes, v_day
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- 7. update_gift
CREATE OR REPLACE FUNCTION public.update_gift(
  p_event_id uuid,
  p_id       uuid,
  p_given_by text    DEFAULT NULL,
  p_amount   numeric DEFAULT NULL,
  p_method   text    DEFAULT NULL,
  p_notes    text    DEFAULT NULL,
  p_day_id   uuid    DEFAULT NULL
)
RETURNS event_gifts LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_gift   event_gifts;
  v_day    uuid;
BEGIN
  SELECT * INTO v_gift FROM event_gifts WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gift not found';
  END IF;

  IF v_gift.event_id != p_event_id THEN
    RAISE EXCEPTION 'Gift does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'gifts', 'full') THEN
    RAISE EXCEPTION 'Insufficient permission to update gifts';
  END IF;

  PERFORM assert_event_writable(p_event_id);
  PERFORM assert_plan(p_event_id, 'gifts');

  IF p_given_by IS NOT NULL AND btrim(p_given_by) = '' THEN
    RAISE EXCEPTION 'A giver name is required';
  END IF;

  IF p_amount IS NOT NULL AND p_amount < 0 THEN
    RAISE EXCEPTION 'Amount cannot be negative';
  END IF;

  -- Re-file the gift onto the chosen day (validated); NULL keeps its current day.
  IF p_day_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM event_days WHERE id = p_day_id AND event_id = p_event_id) THEN
      RAISE EXCEPTION 'Day does not belong to this event';
    END IF;
    v_day := p_day_id;
  ELSE
    v_day := v_gift.day_id;
  END IF;

  UPDATE event_gifts
  SET
    given_by = COALESCE(NULLIF(btrim(p_given_by), ''), given_by),
    amount   = COALESCE(p_amount, amount),
    method   = COALESCE(p_method, method),
    notes    = p_notes,
    day_id   = v_day
  WHERE id = p_id
  RETURNING * INTO v_gift;

  RETURN v_gift;
END;
$$;

-- 8. delete_gift
CREATE OR REPLACE FUNCTION public.delete_gift(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_gift   event_gifts;
BEGIN
  SELECT * INTO v_gift FROM event_gifts WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gift not found';
  END IF;

  IF v_gift.event_id != p_event_id THEN
    RAISE EXCEPTION 'Gift does not belong to this event';
  END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'gifts', 'full') THEN
    RAISE EXCEPTION 'Insufficient permission to delete gifts';
  END IF;

  DELETE FROM event_gifts WHERE id = p_id;
END;
$$;

-- 9. create_event — re-paste of the current body (20260805000003); the ONLY
--    change is the Co-owner seed: budget/gifts read -> full.
CREATE OR REPLACE FUNCTION public.create_event(
  p_slug         text,
  p_name         text,
  p_days         jsonb,
  p_display_name text,
  p_role         text
)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_event_id  uuid;
  v_slug      text;
  v_helper_id uuid;
  v_admin_id  uuid;
  v_member_id uuid;
  v_day_id    uuid;
  v_start     date;
  v_end       date;
  v_free_available boolean;
  rec         record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  IF p_days IS NULL OR jsonb_array_length(p_days) = 0 THEN
    RAISE EXCEPTION 'Select at least one event day';
  END IF;

  IF is_slug_taken(p_slug) THEN
    RAISE EXCEPTION 'This URL is already taken' USING ERRCODE = 'unique_violation';
  END IF;

  SELECT min((d->>'date')::date), max((d->>'date')::date)
  INTO v_start, v_end
  FROM jsonb_array_elements(p_days) AS d;

  v_free_available := free_event_available(v_user_id);

  INSERT INTO events (slug, name, activated_at)
  VALUES (p_slug, p_name, CASE WHEN v_free_available THEN now() ELSE NULL END)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  -- Helper (default, no money) + Co-owner (full money — view + edit). Owner
  -- (root) needs no grant — the is_super_admin bypass covers money.
  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'helper', 'Helper', 3, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_helper_id;

  INSERT INTO event_access_groups (event_id, code, name, rank, permissions)
  VALUES (v_event_id, 'admin', 'Co-owner', 2, '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "vendors":"full","members":"full","access":"read",
    "budget":"full","gifts":"full"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  -- Creator (root/Owner) placed in Co-owner as the NOT NULL placeholder; the
  -- is_super_admin flag, not the group, grants their power.
  INSERT INTO event_members (
    event_id, user_id, display_name, access_group_id,
    role, is_root, is_bride, is_groom, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, p_display_name, v_admin_id,
    p_role, true, (p_role = 'Bride'), (p_role = 'Groom'), now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_settings (event_id) VALUES (v_event_id);

  FOR rec IN
    SELECT DISTINCT ON (dt) dt AS date, lbl AS label
    FROM (
      SELECT (d->>'date')::date              AS dt,
             btrim(COALESCE(d->>'label', '')) AS lbl
      FROM jsonb_array_elements(p_days) AS d
    ) s
    ORDER BY dt
  LOOP
    IF rec.label = '' THEN
      RAISE EXCEPTION 'Each event day needs a label';
    END IF;

    INSERT INTO event_days (event_id, date, label)
    VALUES (v_event_id, rec.date, rec.label)
    RETURNING event_days.id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);
  END LOOP;

  DELETE FROM slug_reservations WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, v_start, v_end, NOT v_free_available;
END;
$$;

-- Rollback: downgrade Co-owner groups back to budget:read/gifts:read, re-paste
-- the 7 money write-RPCs (this file's pre-1b bodies, is_super_admin guard) and
-- create_event (20260805000003).
