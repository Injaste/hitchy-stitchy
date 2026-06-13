-- Drop created_by from event_gifts.
-- Super-admin-only table — creator is always the couple; no FE uses the field.
-- =============================================================================

-- 1) Drop column (CASCADE drops event_gifts_created_by_fk automatically).
ALTER TABLE public.event_gifts DROP COLUMN IF EXISTS created_by;

-- 2) Drop the old create_gift (its INSERT still references created_by).
DROP FUNCTION public.create_gift(uuid, text, numeric, text, text, uuid);

-- 3) Recreate create_gift without the created_by INSERT.
--    v_caller is kept — still needed for the is_super_admin check.
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

  INSERT INTO event_gifts (event_id, given_by, amount, method, notes, day_id)
  VALUES (
    p_event_id, btrim(p_given_by), COALESCE(p_amount, 0),
    COALESCE(p_method, 'envelope'), p_notes, v_day
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Rollback:
--   DROP FUNCTION public.create_gift(uuid, text, numeric, text, text, uuid);
--   <restore original create_gift from 20260613000002_gift_envelopes.sql>
--   ALTER TABLE public.event_gifts ADD COLUMN created_by uuid
--     REFERENCES public.event_members (id) ON DELETE SET NULL;
