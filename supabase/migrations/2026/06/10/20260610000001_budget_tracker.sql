-- Migration: Budget Tracker (Phase 2) — event_budget + event_expenses + RPCs
-- =============================================================================
-- Adds a permission-gated CRUD feature following the recipe in
-- docs/todo/mvp-overview.md. Idempotent / paste-runnable.
--
-- Shape reflects where the feature landed (not the original plan):
--   - no `category`, no `estimated` (couples can't reliably know an estimate)
--   - `amount` = the cost, `paid` = settled so far, balance is the difference
--   - `payer` = free-text "Paid by" label (e.g. "Bride's family")
--
-- Resolves open-decision #2 (budget-total home): the cap lives in its OWN
-- `event_budget` table, NOT on event_settings. Principle — one table = one
-- permission tier: shared/all-member config → event_settings; each gated
-- feature → its own table behind that feature's resource. RLS gates rows, not
-- columns, so co-locating a budget:read figure on the all-member event_settings
-- would force a masking view/RPC. A 1:1 event_budget keeps the whole row
-- sensitive and lets RLS + realtime + PostgREST work natively.
--
-- New `budget` resource. Admin = full, Team = none (money is Pro/sensitive).
-- =============================================================================

-- =============================================================================
-- 1) Tables
-- =============================================================================

-- Budget cap (and any future budget-only config), 1:1 per event.
CREATE TABLE IF NOT EXISTS public.event_budget (
  id           uuid          NOT NULL DEFAULT gen_random_uuid(),
  event_id     uuid          NOT NULL,
  budget_total numeric(12,2),
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT event_budget_pkey         PRIMARY KEY (id),
  CONSTRAINT event_budget_event_id_key UNIQUE (event_id),
  CONSTRAINT event_budget_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE
);

-- Line items.
CREATE TABLE IF NOT EXISTS public.event_expenses (
  id          uuid          NOT NULL DEFAULT gen_random_uuid(),
  event_id    uuid          NOT NULL,
  item        text          NOT NULL,
  vendor_name text,
  payer       text,
  amount      numeric(12,2) NOT NULL DEFAULT 0,
  paid        numeric(12,2) NOT NULL DEFAULT 0,
  due_at      date,
  notes       text,
  created_by  uuid,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT event_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT event_expenses_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE,
  CONSTRAINT event_expenses_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.event_members (id) ON DELETE SET NULL,
  CONSTRAINT event_expenses_amount_chk CHECK (amount >= 0),
  CONSTRAINT event_expenses_paid_chk   CHECK (paid >= 0)
);

CREATE INDEX IF NOT EXISTS event_expenses_event_id_idx
  ON public.event_expenses (event_id);

-- =============================================================================
-- 2) RLS — SELECT only; all writes go through SECURITY DEFINER RPCs.
--    Both budget tables: the whole row is sensitive, so gate reads on
--    budget:read (mirrors event_rsvps_select). event_settings is untouched.
-- =============================================================================
ALTER TABLE public.event_budget   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_budget_select ON public.event_budget;
CREATE POLICY event_budget_select ON public.event_budget
  FOR SELECT TO authenticated
  USING (
    is_event_member(event_id)
    AND has_event_permission(event_id, 'budget', 'read')
  );

DROP POLICY IF EXISTS event_expenses_select ON public.event_expenses;
CREATE POLICY event_expenses_select ON public.event_expenses
  FOR SELECT TO authenticated
  USING (
    is_event_member(event_id)
    AND has_event_permission(event_id, 'budget', 'read')
  );

-- =============================================================================
-- 3) Permission resource catalog
-- =============================================================================
INSERT INTO public.event_resources (resource)
SELECT 'budget'
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_resources WHERE resource = 'budget'
);

-- =============================================================================
-- 4) create_event — seed the budget row + grant the resource (Admin = full).
--    Re-pastes the current 6-arg body verbatim; only the Admin jsonb and the
--    event_budget seed are added.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_event(p_slug text, p_name text, p_date_start date, p_date_end date, p_display_name text, p_role text)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_email     text := auth.jwt() ->> 'email';
  v_event_id  uuid;
  v_slug      text;
  v_admin_id  uuid;
  v_team_id   uuid;
  v_member_id uuid;
  v_day_id    uuid;
  d           date;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  INSERT INTO events (slug, name, date_start, date_end)
  VALUES (p_slug, p_name, p_date_start, p_date_end)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "themes":"full","members":"full","access":"read","budget":"full"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"full","members":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

  INSERT INTO event_members (
    event_id, user_id, email, display_name, access_group_id,
    role, is_root, is_bride, is_groom, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, v_email, p_display_name, v_admin_id,
    p_role, true, (p_role = 'Bride'), (p_role = 'Groom'), now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_invitation (event_id) VALUES (v_event_id);
  INSERT INTO event_settings (event_id) VALUES (v_event_id);
  INSERT INTO event_budget (event_id) VALUES (v_event_id);

  -- Seed one day per calendar date in the range, each with a default segment.
  FOR d IN
    SELECT gs::date
    FROM generate_series(p_date_start, p_date_end, interval '1 day') AS gs
  LOOP
    INSERT INTO event_days (event_id, date)
    VALUES (v_event_id, d)
    RETURNING id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);
  END LOOP;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, p_date_start, p_date_end, false;
END;
$$;

-- Backfill existing events (idempotent): grant Admin budget:full + seed a row.
UPDATE public.event_access_groups
SET permissions = permissions || '{"budget":"full"}'::jsonb
WHERE name = 'Admin';

INSERT INTO public.event_budget (event_id)
SELECT e.id FROM public.events e
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_budget b WHERE b.event_id = e.id
);

-- =============================================================================
-- 5) RPCs — create / update / delete expense + update budget.
--    No read RPC: the whole event_budget / event_expenses rows are sensitive,
--    so RLS-gated SELECTs are the read path. touch_updated_at attaches
--    automatically via the DDL event trigger.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_expense(
  p_event_id    uuid,
  p_item        text,
  p_vendor_name text    DEFAULT NULL,
  p_payer       text    DEFAULT NULL,
  p_amount      numeric DEFAULT 0,
  p_paid        numeric DEFAULT 0,
  p_due_at      date    DEFAULT NULL,
  p_notes       text    DEFAULT NULL
)
RETURNS event_expenses LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_row    event_expenses;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'budget', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create expenses';
  END IF;

  IF btrim(COALESCE(p_item, '')) = '' THEN
    RAISE EXCEPTION 'Item is required';
  END IF;

  IF COALESCE(p_amount, 0) < 0 OR COALESCE(p_paid, 0) < 0 THEN
    RAISE EXCEPTION 'Amounts cannot be negative';
  END IF;

  IF COALESCE(p_paid, 0) > COALESCE(p_amount, 0) THEN
    RAISE EXCEPTION 'Paid cannot exceed the amount';
  END IF;

  INSERT INTO event_expenses (
    event_id, item, vendor_name, payer, amount, paid, due_at, notes, created_by
  )
  VALUES (
    p_event_id, btrim(p_item), p_vendor_name, p_payer,
    COALESCE(p_amount, 0), COALESCE(p_paid, 0), p_due_at, p_notes, v_caller.id
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_expense(
  p_event_id    uuid,
  p_id          uuid,
  p_item        text    DEFAULT NULL,
  p_vendor_name text    DEFAULT NULL,
  p_payer       text    DEFAULT NULL,
  p_amount      numeric DEFAULT NULL,
  p_paid        numeric DEFAULT NULL,
  p_due_at      date    DEFAULT NULL,
  p_notes       text    DEFAULT NULL
)
RETURNS event_expenses LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller  event_members;
  v_expense event_expenses;
  v_amount  numeric;
  v_paid    numeric;
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

  IF NOT has_event_permission(p_event_id, 'budget', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update expenses';
  END IF;

  v_amount := COALESCE(p_amount, v_expense.amount);
  v_paid   := COALESCE(p_paid, v_expense.paid);

  IF v_amount < 0 OR v_paid < 0 THEN
    RAISE EXCEPTION 'Amounts cannot be negative';
  END IF;

  IF v_paid > v_amount THEN
    RAISE EXCEPTION 'Paid cannot exceed the amount';
  END IF;

  -- The edit form always submits the full record, so nullable fields are set
  -- directly (null clears them); item keeps its value if blank.
  UPDATE event_expenses
  SET
    item        = COALESCE(NULLIF(btrim(p_item), ''), item),
    vendor_name = p_vendor_name,
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

  IF NOT has_event_permission(p_event_id, 'budget', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to delete expenses';
  END IF;

  DELETE FROM event_expenses WHERE id = p_id;
END;
$$;

-- Update (or clear, when p_amount IS NULL) the event's total budget. The 1:1
-- row is seeded in create_event + backfilled, so this is a plain update
-- (mirrors update_invitation).
CREATE OR REPLACE FUNCTION public.update_budget(p_event_id uuid, p_amount numeric)
RETURNS event_budget LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_row    event_budget;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'budget', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update the budget';
  END IF;

  IF p_amount IS NOT NULL AND p_amount < 0 THEN
    RAISE EXCEPTION 'Budget cannot be negative';
  END IF;

  UPDATE event_budget
  SET budget_total = p_amount
  WHERE event_id = p_event_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Budget not found for this event';
  END IF;

  RETURN v_row;
END;
$$;
