-- Migration: Gift Envelopes (ang bao / sampul duit / shagun ledger).
-- =============================================================================
-- A per-day ledger of cash gifts. Super-admin only — the couple's eyes only —
-- mirroring the budget surface (reads via is_super_admin_member, writes via
-- SECURITY DEFINER RPCs gated on is_super_admin). The `gifts` resource is added
-- to the catalog so the access matrix lists it, but it is granted to NO group:
-- only super-admins reach it (via the bypass in has_event_permission /
-- useAccess), exactly like budget.
--
--   * NO INSERT/UPDATE/DELETE policies — all writes go through the RPCs.
--   * `day_id` (NOT NULL) tags each gift's event_day; create_gift resolves a NULL
--     pick to the event's earliest day. ON DELETE RESTRICT — a day with gifts
--     can't be deleted (delete_day raises a friendly count first), like budget.
--   * `touch_updated_at` auto-attaches via auto_attach_triggers_on_create at
--     CREATE TABLE time — no manual trigger here.
-- =============================================================================

-- 1) event_gifts table. ------------------------------------------------------
CREATE TABLE public.event_gifts (
  id         uuid          NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid          NOT NULL,
  given_by   text          NOT NULL,
  amount     numeric(12,2) NOT NULL DEFAULT 0,
  method     text          NOT NULL DEFAULT 'envelope',
  notes      text,
  day_id     uuid          NOT NULL,  -- the gift's event_day (see header)
  created_by uuid,
  created_at timestamptz   NOT NULL DEFAULT now(),
  updated_at timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT event_gifts_pkey PRIMARY KEY (id),
  CONSTRAINT event_gifts_event_id_fk
    FOREIGN KEY (event_id)   REFERENCES public.events (id)        ON DELETE CASCADE,
  CONSTRAINT event_gifts_day_id_fk
    FOREIGN KEY (day_id)     REFERENCES public.event_days (id)    ON DELETE RESTRICT,
  CONSTRAINT event_gifts_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.event_members (id) ON DELETE SET NULL,
  CONSTRAINT event_gifts_amount_chk CHECK (amount >= 0),
  CONSTRAINT event_gifts_method_chk
    CHECK (method IN ('envelope', 'cash', 'transfer', 'others'))
);
CREATE INDEX event_gifts_event_id_idx ON public.event_gifts (event_id);

-- 2) RLS — super-admin only reads; no write policies (RPCs only). ------------
ALTER TABLE public.event_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_gifts_select ON public.event_gifts
  FOR SELECT TO authenticated
  USING (is_super_admin_member(event_id));

-- 3) Resource catalog — list `gifts` so the access matrix can show it. Granted
--    to no group; super-admins see it via the bypass. Idempotent.
INSERT INTO public.event_resources (resource)
SELECT 'gifts'
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_resources WHERE resource = 'gifts'
);

-- 4) Write RPCs — super-admin only. ------------------------------------------

-- create_gift: add a gift to the ledger.
CREATE FUNCTION public.create_gift(
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

  INSERT INTO event_gifts (event_id, given_by, amount, method, notes, day_id, created_by)
  VALUES (
    p_event_id, btrim(p_given_by), COALESCE(p_amount, 0),
    COALESCE(p_method, 'envelope'), p_notes, v_day, v_caller.id
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- update_gift: edit an existing gift.
CREATE FUNCTION public.update_gift(
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

-- delete_gift: remove a gift.
CREATE FUNCTION public.delete_gift(p_event_id uuid, p_id uuid)
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

  IF NOT is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Insufficient permission to delete gifts';
  END IF;

  DELETE FROM event_gifts WHERE id = p_id;
END;
$$;

-- 5) delete_day — also block on gifts (event_gifts.day_id is RESTRICT). Re-pastes
--    the current body + a gift count so it reads as a message, not an FK error.
CREATE OR REPLACE FUNCTION public.delete_day(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count    integer;
  v_items    integer;
  v_expenses integer;
  v_gifts    integer;
BEGIN
  IF NOT is_super_admin_member(p_event_id) THEN
    RAISE EXCEPTION 'Insufficient permission to delete days';
  END IF;

  SELECT count(*) INTO v_count FROM event_days WHERE event_id = p_event_id;
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'An event must keep at least one day';
  END IF;

  SELECT count(*) INTO v_items
  FROM event_timelines t
  JOIN event_segments s ON s.id = t.segment_id
  WHERE s.day_id = p_id AND t.event_id = p_event_id;
  IF v_items > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % schedule item(s) before deleting it', v_items;
  END IF;

  SELECT count(*) INTO v_expenses
  FROM event_expenses e
  JOIN event_budget b ON b.id = e.budget_id
  WHERE b.day_id = p_id AND e.event_id = p_event_id;
  IF v_expenses > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % expense(s) before deleting it', v_expenses;
  END IF;

  -- Gifts attach directly via event_gifts.day_id (RESTRICT FK).
  SELECT count(*) INTO v_gifts
  FROM event_gifts WHERE day_id = p_id AND event_id = p_event_id;
  IF v_gifts > 0 THEN
    RAISE EXCEPTION 'Remove this day''s % gift(s) before deleting it', v_gifts;
  END IF;

  DELETE FROM event_days WHERE id = p_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day not found';
  END IF;
END;
$$;

-- Rollback:
--   restore delete_day from migration 20260613000001 (drop the v_gifts block);
--   DROP FUNCTION public.create_gift(uuid, text, numeric, text, text, uuid);
--   DROP FUNCTION public.update_gift(uuid, uuid, text, numeric, text, text, uuid);
--   DROP FUNCTION public.delete_gift(uuid, uuid);
--   DELETE FROM public.event_resources WHERE resource = 'gifts';
--   DROP TABLE public.event_gifts;
