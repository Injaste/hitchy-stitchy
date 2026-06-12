-- Migration: per-day budget + super-admin-only.
-- =============================================================================
-- Two coupled changes to the budget surface:
--  (a) PER-DAY — event_budget becomes per-day buckets, expenses belong to one.
--      Mirrors timeline's item -> segment -> day, at day granularity, and like
--      event_segments.day_id the day_id is NOT NULL — every bucket (and so every
--      expense) is always tied to a real event_day. No General/all-days bucket:
--      a whole-wedding expense is filed under one day. Single-day events are the
--      flat case (one day, no day UI).
--        event_expenses.budget_id -> event_budget(day_id) -> event_days
--      Buckets are lazy (materialise on first cap/expense); the day-delete guard
--      falls out of the FKs: day -> CASCADE bucket -> RESTRICT if it holds money.
--  (b) SUPER-ADMIN ONLY — money is the couple's eyes only. Reads (RLS) + writes
--      (RPCs) check is_super_admin / is_super_admin_member, NOT the `budget`
--      permission. A delegated Admin can no longer see or touch budget.
-- =============================================================================

-- 1) event_budget -> per-day buckets (day_id NOT NULL). ----------------------
ALTER TABLE public.event_budget
  DROP CONSTRAINT event_budget_event_id_key,
  ADD COLUMN day_id uuid REFERENCES public.event_days (id) ON DELETE CASCADE;

-- Existing 1:1 rows: pin to the event's earliest day (every event has >=1 day).
UPDATE public.event_budget b
SET day_id = (
  SELECT d.id FROM public.event_days d
  WHERE d.event_id = b.event_id
  ORDER BY d.date, d.id
  LIMIT 1
)
WHERE b.day_id IS NULL;

ALTER TABLE public.event_budget
  ALTER COLUMN day_id SET NOT NULL,
  ADD CONSTRAINT event_budget_event_day_key UNIQUE (event_id, day_id);

-- 2) event_expenses -> belong to a bucket. -----------------------------------
ALTER TABLE public.event_expenses
  ADD COLUMN budget_id uuid REFERENCES public.event_budget (id) ON DELETE RESTRICT;

-- One bucket per event at this point, so the join is unambiguous.
UPDATE public.event_expenses e
SET budget_id = b.id
FROM public.event_budget b
WHERE b.event_id = e.event_id;

ALTER TABLE public.event_expenses ALTER COLUMN budget_id SET NOT NULL;
CREATE INDEX event_expenses_budget_id_idx ON public.event_expenses (budget_id);

-- 3) Reads -> super-admin only (was budget:read). ----------------------------
DROP POLICY IF EXISTS event_budget_select   ON public.event_budget;
DROP POLICY IF EXISTS event_expenses_select ON public.event_expenses;

CREATE POLICY event_budget_select ON public.event_budget
  FOR SELECT TO authenticated
  USING (is_super_admin_member(event_id));

CREATE POLICY event_expenses_select ON public.event_expenses
  FOR SELECT TO authenticated
  USING (is_super_admin_member(event_id));

-- Strip the now-vestigial `budget` grant from every existing access group — no
-- group should carry it. (The `budget` resource stays in the catalog, so the
-- access page still lists it as none for all groups; the couple sees it via the
-- super-admin bypass.)
UPDATE public.event_access_groups
SET permissions = permissions - 'budget'
WHERE permissions ? 'budget';

-- Team reads the access page by default (create_event seeds "access":"read" for
-- new events) — backfill existing Team groups to match.
UPDATE public.event_access_groups
SET permissions = permissions || '{"access":"read"}'::jsonb
WHERE name = 'Team' AND NOT (permissions ? 'access');

-- 4) Helper: find-or-create the (event, day) bucket. A NULL p_day_id defaults
--    to the event's earliest day, so flat single-day callers just work; the
--    bucket itself is always tied to a real day. Internal to the budget RPCs.
CREATE OR REPLACE FUNCTION public.get_or_create_budget_bucket(p_event_id uuid, p_day_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day uuid;
  v_id  uuid;
BEGIN
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

  SELECT id INTO v_id FROM event_budget
  WHERE event_id = p_event_id AND day_id = v_day;

  IF v_id IS NULL THEN
    INSERT INTO event_budget (event_id, day_id) VALUES (p_event_id, v_day)
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

-- Internal only — the budget RPCs call it as definer; the FE must NOT be able to
-- invoke it directly (it writes rows with no super-admin check of its own).
REVOKE EXECUTE ON FUNCTION public.get_or_create_budget_bucket(uuid, uuid)
  FROM PUBLIC, anon, authenticated;

-- 5) create_event — drop the eager event_budget seed (buckets are lazy per day
--    now; a 1:1 NULL-day seed would violate day_id NOT NULL). Re-pastes the
--    current body (20260611000005) verbatim minus that one INSERT.
-- -----------------------------------------------------------------------------
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
  v_admin_id  uuid;
  v_team_id   uuid;
  v_member_id uuid;
  v_day_id    uuid;
  v_start     date;
  v_end       date;
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

  INSERT INTO events (slug, name)
  VALUES (p_slug, p_name)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  -- No budget grant — budget is super-admin only (the couple), enforced by the
  -- RPCs/RLS below. The `budget` resource stays in the catalog for discovery.
  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "themes":"full","members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"full","members":"read","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

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

  INSERT INTO event_invitation (event_id) VALUES (v_event_id);
  INSERT INTO event_settings (event_id) VALUES (v_event_id);
  -- (no event_budget seed — buckets are lazy, per day)

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
  SELECT v_event_id, v_slug, p_name, v_start, v_end, false;
END;
$$;

-- 6) Writes -> super-admin only + p_day_id. Signatures change, so DROP first. -
DROP FUNCTION IF EXISTS public.create_expense(uuid, text, text, text, numeric, numeric, date, text);
DROP FUNCTION IF EXISTS public.update_expense(uuid, uuid, text, text, text, numeric, numeric, date, text);
DROP FUNCTION IF EXISTS public.update_budget(uuid, numeric);

-- create_expense: super-admin only; lands the expense in the (event, day) bucket.
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
    event_id, budget_id, item, vendor_name, payer, amount, paid, due_at, notes, created_by
  )
  VALUES (
    p_event_id, v_budget_id, btrim(p_item), p_vendor_name, p_payer,
    COALESCE(p_amount, 0), COALESCE(p_paid, 0), p_due_at, p_notes, v_caller.id
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- update_expense: super-admin only; re-points the expense to the (event, day)
-- bucket. p_day_id is authoritative (the form sends the day in view).
CREATE FUNCTION public.update_expense(
  p_event_id    uuid,
  p_id          uuid,
  p_item        text    DEFAULT NULL,
  p_vendor_name text    DEFAULT NULL,
  p_payer       text    DEFAULT NULL,
  p_amount      numeric DEFAULT NULL,
  p_paid        numeric DEFAULT NULL,
  p_due_at      date    DEFAULT NULL,
  p_notes       text    DEFAULT NULL,
  p_day_id      uuid    DEFAULT NULL
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

  v_budget_id := get_or_create_budget_bucket(p_event_id, p_day_id);

  UPDATE event_expenses
  SET
    budget_id   = v_budget_id,
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

-- delete_expense: super-admin only (was budget 'delete'). Signature unchanged.
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

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to delete expenses';
  END IF;

  DELETE FROM event_expenses WHERE id = p_id;
END;
$$;

-- update_budget: super-admin only; set (or clear) the cap on the (event, day)
-- bucket. NULL p_day_id resolves to the event's earliest day.
CREATE FUNCTION public.update_budget(p_event_id uuid, p_amount numeric, p_day_id uuid DEFAULT NULL)
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

  IF NOT is_super_admin(v_caller) THEN
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

-- Rollback:
--   - Reads back to budget:read: recreate event_budget_select /
--     event_expenses_select with has_event_permission(event_id,'budget','read').
--   - Collapse per-day: ALTER TABLE event_expenses DROP COLUMN budget_id;
--       keep one bucket per event (delete extras), DROP UNIQUE(event_id,day_id),
--       DROP COLUMN day_id, ADD CONSTRAINT event_budget_event_id_key UNIQUE(event_id).
--   - DROP get_or_create_budget_bucket; restore create_event's event_budget seed
--     and re-run create/update/delete_expense + update_budget from 20260610000001.
