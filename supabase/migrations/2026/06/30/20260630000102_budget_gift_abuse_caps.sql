-- Migration: enforce budget + gift abuse ceilings (Phase 2 of granular gating)
-- =============================================================================
-- max_expenses / max_gifts were stored + advertised but enforced NOWHERE (no
-- plan_within_limits branch, no check in create_expense / create_gift, not in the
-- over-limit lock). They're now real, like timeline's top cap — a flat fair-use /
-- abuse ceiling at 2000, NOT a tier lever:
--
--   • Both features are Pro+-only (the module gate, assert_plan('budget'/'gifts'),
--     is the actual paywall). The count cap is a flat 2000 on the tiers that have
--     the feature (Pro + Advanced) — realistically unreachable, there only to bound
--     a runaway/abusive event. It is NOT shown in the upgrade diff (a separate
--     client change drops maxExpenses/maxGifts from PLAN_CAP_LABELS).
--   • Resource keys: 'expenses' (event_expenses) and 'gift_envelopes' (event_gifts).
--     The plain 'gifts' key is already taken by the can_use_gifts FEATURE flag, so
--     the gift COUNT gets its own key.
--   • The count assert runs AFTER the feature gate in each create RPC, so Starter/
--     Plus still get the "not in your plan" message, never a count message.
--
-- Re-pastes are verbatim current bodies (plan_within_limits = 20260630000101;
-- create_expense = 20260613000005; create_gift = 20260618000107) with only the
-- `-- NEW`-marked lines added. get_bootstrap_context is NOT touched — it reads the
-- cap values dynamically, so the UPDATE below is all the value change needed.
-- =============================================================================

BEGIN;

-- 1) Flat 2000 abuse ceiling. Only Pro changes (Advanced already 2000; Starter/
--    Plus stay 0 — moot, the module gate blocks them first).
UPDATE public.plans SET max_expenses = 2000, max_gifts = 2000 WHERE key = 'solo_3_v1';

-- 2) plan_within_limits — re-paste (20260630000101 body) + expenses / gift_envelopes
--    count branches.
CREATE OR REPLACE FUNCTION public.plan_within_limits(
  p_event_id uuid,
  p_resource text,
  p_adding   int  DEFAULT 1,
  p_scope_id uuid DEFAULT NULL
)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_plan  plans;
  v_used  int;
  v_total int;
BEGIN
  SELECT p.* INTO v_plan FROM plans p WHERE p.key = effective_plan_key(p_event_id);
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  CASE p_resource
    -- feature flags
    WHEN 'budget'   THEN RETURN v_plan.can_use_budget;
    WHEN 'gifts'    THEN RETURN v_plan.can_use_gifts;
    WHEN 'branding' THEN RETURN v_plan.can_remove_branding;

    -- numeric caps
    WHEN 'guests' THEN
      -- TWO caps: ACTIVE (non-cancelled) ≤ max_guests (the firm business limit),
      -- and TOTAL (incl cancelled) ≤ max_guests + the cancelled grace. So
      -- cancelled rows are free up to grace%, then they count — bounding the
      -- fake-cancelled loophole. Assumes the add is a live guest (the dominant
      -- path); a cancelled add is checked against active too (conservative/rare).
      SELECT COALESCE(sum(guest_count) FILTER (WHERE status <> 'cancelled'), 0),
             COALESCE(sum(guest_count), 0)
        INTO v_used, v_total
        FROM event_rsvps WHERE event_id = p_event_id;
      RETURN v_used  + p_adding <= v_plan.max_guests
         AND v_total + p_adding <= floor(v_plan.max_guests * (1 + v_plan.cancelled_grace_pct));

    WHEN 'days' THEN
      SELECT count(*) INTO v_used FROM event_days WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_days;

    WHEN 'segments' THEN
      -- named segments only; the auto-seeded NULL-name default doesn't count.
      SELECT count(*) INTO v_used
      FROM event_segments WHERE day_id = p_scope_id AND name IS NOT NULL;
      RETURN v_used + p_adding <= v_plan.max_segments_per_day;

    WHEN 'pages' THEN
      SELECT count(*) INTO v_used
      FROM event_invitations WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_invitation_pages;

    WHEN 'members' THEN
      SELECT count(*) INTO v_used
      FROM event_members WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_members;

    WHEN 'timeline_items' THEN
      SELECT count(*) INTO v_used
      FROM event_timelines WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_timeline_items;

    WHEN 'expenses' THEN                                -- NEW: budget abuse ceiling
      SELECT count(*) INTO v_used
      FROM event_expenses WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_expenses;

    WHEN 'gift_envelopes' THEN                          -- NEW: gift abuse ceiling
      SELECT count(*) INTO v_used
      FROM event_gifts WHERE event_id = p_event_id;
      RETURN v_used + p_adding <= v_plan.max_gifts;

    ELSE
      RAISE EXCEPTION 'Unknown plan resource: %', p_resource;
  END CASE;
END;
$$;

-- 3) create_expense — re-paste (20260613000005 body) + the expense-count assert.
--    Placed AFTER get_or_create_budget_bucket, which carries assert_plan('budget')
--    (feature) + assert_event_writable — so the feature gate fires first.
CREATE OR REPLACE FUNCTION public.create_expense(
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
  PERFORM assert_plan(p_event_id, 'expenses');   -- NEW: per-event expense ceiling

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

-- 4) create_gift — re-paste (20260618000107 body) + the gift-count assert, after
--    the existing feature gate.
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

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to record gifts';
  END IF;

  PERFORM assert_event_writable(p_event_id);
  PERFORM assert_plan(p_event_id, 'gifts');           -- feature gate (first)
  PERFORM assert_plan(p_event_id, 'gift_envelopes');  -- NEW: per-event gift ceiling

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

COMMIT;

-- Rollback:
--   UPDATE public.plans SET max_expenses = 200, max_gifts = 200 WHERE key = 'solo_3_v1';
--   Re-paste plan_within_limits (20260630000101), create_expense (20260613000005)
--     and create_gift (20260618000107) WITHOUT the `-- NEW`-marked lines.
