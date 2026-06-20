-- Migration: Subscription plans (107) — plan gates on budget + gift writes
-- =============================================================================
-- Budget and gifts are Pro modules (Free: can_use_budget / can_use_gifts =
-- false). Gate their WRITES; deletes stay ungated (a dormant module on a
-- downgraded event must still be cleanable — and delete_day's RESTRICT on gifts
-- means a gift has to be deletable to trim an over-limit day).
--
--   • Budget: every write (create_expense / update_expense / update_budget)
--     funnels through get_or_create_budget_bucket — already internal-only — so
--     gating that ONE chokepoint covers all three. delete_expense doesn't call
--     it → stays open.
--   • Gifts: create_gift / update_gift gated directly. delete_gift stays open.
--
-- Each gate = assert_event_writable (paid/active + not over-limit) then
-- assert_plan(<module>) (the feature flag). Bodies re-pasted verbatim; only the
-- two PERFORM lines are new.
-- =============================================================================

-- ── budget chokepoint ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_or_create_budget_bucket(p_event_id uuid, p_day_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day uuid;
  v_id  uuid;
BEGIN
  PERFORM assert_event_writable(p_event_id);   -- NEW: active + over-limit lock
  PERFORM assert_plan(p_event_id, 'budget');   -- NEW: budget is a Pro feature

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

-- Stays internal — the budget RPCs call it as definer; never exposed to the FE.
REVOKE EXECUTE ON FUNCTION public.get_or_create_budget_bucket(uuid, uuid)
  FROM PUBLIC, anon, authenticated;

-- ── create_gift ──────────────────────────────────────────────────────────────
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

  PERFORM assert_event_writable(p_event_id);   -- NEW
  PERFORM assert_plan(p_event_id, 'gifts');    -- NEW

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

-- ── update_gift ──────────────────────────────────────────────────────────────
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

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to update gifts';
  END IF;

  PERFORM assert_event_writable(p_event_id);   -- NEW
  PERFORM assert_plan(p_event_id, 'gifts');    -- NEW

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

-- Rollback: re-paste the pre-gate bodies (drop the two PERFORM lines from
-- get_or_create_budget_bucket / create_gift / update_gift).
