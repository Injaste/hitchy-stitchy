-- Migration: over-limit lock counts ACTIVE guests, not cancelled
-- =============================================================================
-- Bug: is_over_plan_limits (the downgrade/edit lock, reached via
-- assert_within_plan → assert_event_writable on every create_/update_ RPC)
-- summed ALL guest_count INCLUDING cancelled rows against the raw max_guests.
-- But the ADD-check plan_within_limits('guests') deliberately allows
-- total-incl-cancelled up to the grace ceiling floor(max_guests*(1+grace)). So
-- an event that uses the grace, or just accumulates normal cancel/re-book churn,
-- ends up with total > max_guests and gets FALSELY edit-locked — every create/
-- update is blocked and only deletes work, even though its ACTIVE (attending)
-- guests are within cap.
--
-- Fix: the lock's guest clause now counts ACTIVE (non-cancelled) guests against
-- max_guests — the real entitlement measure (cancelled people aren't attending,
-- so they don't consume the plan). Anti-abuse is UNCHANGED: it lives in the
-- add-check (plan_within_limits bounds total-incl-cancelled at the grace
-- ceiling), so fake-cancels still can't exceed ~grace% over the cap. Cancelled
-- rows simply no longer freeze the event.
--
-- Re-paste of is_over_plan_limits (= is_event_over_plan from 20260618000104,
-- renamed by 20260618000112) — only the guest clause's FILTER is new.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.is_over_plan_limits(p_event_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_plan plans;
BEGIN
  SELECT p.* INTO v_plan FROM plans p WHERE p.key = effective_plan_key(p_event_id);
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF (SELECT count(*) FROM event_days WHERE event_id = p_event_id)
       > v_plan.max_days THEN RETURN true; END IF;

  -- ACTIVE (non-cancelled) guests only. Cancelled rows don't consume the plan's
  -- entitlement; the cancelled-grace anti-abuse lives in plan_within_limits'
  -- add-check (total-incl-cancelled ≤ grace ceiling), not here.
  IF (SELECT COALESCE(sum(guest_count) FILTER (WHERE status <> 'cancelled'), 0)
        FROM event_rsvps WHERE event_id = p_event_id)
       > v_plan.max_guests THEN RETURN true; END IF;   -- NEW: + FILTER

  IF (SELECT count(*) FROM event_members WHERE event_id = p_event_id)
       > v_plan.max_members THEN RETURN true; END IF;

  IF (SELECT count(*) FROM event_invitations WHERE event_id = p_event_id)
       > v_plan.max_invitation_pages THEN RETURN true; END IF;

  IF EXISTS (
    SELECT 1 FROM event_segments
    WHERE event_id = p_event_id AND name IS NOT NULL
    GROUP BY day_id
    HAVING count(*) > v_plan.max_segments_per_day
  ) THEN RETURN true; END IF;

  RETURN false;
END;
$$;

COMMIT;

-- Rollback: re-paste is_over_plan_limits from 20260618000104's is_event_over_plan
-- body WITHOUT the FILTER on the guest clause (sum(guest_count) over all rows).
