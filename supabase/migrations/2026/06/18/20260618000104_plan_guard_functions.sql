-- Migration: Subscription plans (104) — plan resolution + enforcement helpers
-- =============================================================================
-- New SECURITY DEFINER helpers. ADDITIVE — no existing RPC is touched here; the
-- write RPCs are wired to these in a later migration. They resolve an event's
-- effective plan version and enforce both the per-resource caps/flags and the
-- whole-event over-limit edit lock.
--
--   effective_plan_key(event)        the plan version in force = the pinned
--                                    plan_key (grandfathering falls out of the
--                                    pin). Trial override removed — re-add a
--                                    branch here to bring it back.
--   plan_allows(event,res,n,scope)   may this action proceed? flags return
--                                    their bool; numeric caps return
--                                    (current + n) <= limit. One guard, both.
--   assert_plan(...)                 raises a friendly message when not allowed.
--   is_event_over_plan(event)        any COUNTABLE over the effective cap?
--                                    (only a downgrade — e.g. a refund — can
--                                    produce this; per-resource checks stop
--                                    a within-limits event from ever exceeding.)
--   assert_within_plan(event)        raises when over-limit: the whole-event
--                                    edit lock. (delete_ RPCs stay open as the
--                                    escape hatch so users can trim back.)
--   free_event_available(user)       may this account stand up a NEW free-tier
--                                    event at $0? (the concurrent "1 free event"
--                                    allowance — no active free-tier event yet.)
--   assert_event_activated(event)    raises when activated_at IS NULL: the
--                                    pending-payment lock (a 2nd+ unpaid event).
--                                    NB an activated event isn't necessarily PAID
--                                    — the free allowance event is activated too.
--   assert_event_writable(event)     gate for create_/update_ RPCs: activated
--                                    (paid OR free-allowance) AND within plan.
--
-- "Over limit" = COUNTABLES only (days/segments/pages/guests/members). Dormant
-- budget/gifts data is read-only on downgrade but does NOT lock the event, so
-- nobody is forced to delete their budget just to edit a guest.
-- =============================================================================

-- Resolve the plan version in force for an event = its pinned plan_key.
-- (The 7-day trial override was removed — re-add a CASE branch here, keyed on a
-- per-account trial source, to bring it back.)
CREATE OR REPLACE FUNCTION public.effective_plan_key(p_event_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT plan_key FROM events WHERE id = p_event_id;
$$;

-- One guard for both feature flags and numeric caps. p_adding = how many rows
-- the caller is about to insert; p_scope_id = day_id (segments are per-day).
CREATE OR REPLACE FUNCTION public.plan_allows(
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

    ELSE
      RAISE EXCEPTION 'Unknown plan resource: %', p_resource;
  END CASE;
END;
$$;

-- Raising wrapper — keeps the user-facing copy in one place.
CREATE OR REPLACE FUNCTION public.assert_plan(
  p_event_id uuid,
  p_resource text,
  p_adding   int  DEFAULT 1,
  p_scope_id uuid DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF plan_allows(p_event_id, p_resource, p_adding, p_scope_id) THEN
    RETURN;
  END IF;

  RAISE EXCEPTION '%',
    CASE p_resource
      WHEN 'budget'   THEN 'Budget tracking is a Pro feature. Upgrade to Pro to use it.'
      WHEN 'gifts'    THEN 'Gift tracking is a Pro feature. Upgrade to Pro to use it.'
      WHEN 'branding' THEN 'Removing branding is a Pro feature. Upgrade to Pro.'
      WHEN 'guests'   THEN 'You''ve reached your plan''s guest limit. Upgrade to Pro to add more.'
      WHEN 'days'     THEN 'Your plan allows a single event day. Upgrade to Pro for multiple days.'
      WHEN 'segments' THEN 'You''ve reached your plan''s segment limit. Upgrade to Pro to add more.'
      WHEN 'pages'    THEN 'Your plan allows a single invitation page. Upgrade to Pro for more.'
      WHEN 'members'  THEN 'You''ve reached your plan''s collaborator limit. Upgrade to Pro to add more.'
      ELSE 'This action exceeds your plan limits. Upgrade to Pro.'
    END
    USING ERRCODE = 'check_violation';
END;
$$;

-- True when any COUNTABLE exceeds the effective plan's cap (the lock trigger).
CREATE OR REPLACE FUNCTION public.is_event_over_plan(p_event_id uuid)
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

  IF (SELECT COALESCE(sum(guest_count), 0) FROM event_rsvps WHERE event_id = p_event_id)
       > v_plan.max_guests THEN RETURN true; END IF;

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

-- Whole-event over-limit lock. Call at the top of create_/update_ RPCs; NEVER in
-- delete_ RPCs (deletes are how an over-limit user trims back under caps).
CREATE OR REPLACE FUNCTION public.assert_within_plan(p_event_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF is_event_over_plan(p_event_id) THEN
    RAISE EXCEPTION 'This event is over your Free plan''s limits. Remove items to get back within limits, or upgrade to Pro to restore everything.'
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

-- Concurrent "1 free event" allowance: TRUE when the account has NO active
-- free-tier event yet. The first free-tier event is always the $0 freebie — you
-- can't pay for free-tier before using your allowance — so a 2nd+ free event is
-- created pending and must be paid. Deleting/upgrading the free event frees the
-- slot (concurrent). Used by create_event to decide a new event's activated_at.
CREATE OR REPLACE FUNCTION public.free_event_available(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM events e
    JOIN event_members owner
      ON owner.event_id = e.id AND owner.is_root AND owner.user_id = p_user_id
    WHERE e.plan_key = 'free'
      AND e.activated_at IS NOT NULL
      AND e.deleted_at IS NULL
  );
$$;

-- Pending-payment lock: a non-allowance event is created with activated_at NULL
-- and stays locked until its Stripe webhook activates it. (An activated event is
-- not necessarily PAID — the free allowance event is activated at $0.) Same shape
-- as the over-limit lock (blocks create_/update_; delete_ stays open).
CREATE OR REPLACE FUNCTION public.assert_event_activated(p_event_id uuid)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM events WHERE id = p_event_id AND activated_at IS NULL) THEN
    RAISE EXCEPTION 'This event is awaiting payment. Complete checkout to activate it.'
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

-- Single gate for write RPCs: must be activated (paid OR free-allowance) AND
-- within plan. Each raises its own message. create_/update_ call this; delete_ not.
CREATE OR REPLACE FUNCTION public.assert_event_writable(p_event_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM assert_event_activated(p_event_id);  -- pending-payment lock
  PERFORM assert_within_plan(p_event_id);      -- over-limit lock
END;
$$;

-- Drop the pre-rename names (assert_event_active → assert_event_activated,
-- assert_event_editable → assert_within_plan). After assert_event_writable above
-- points at the new names, so nothing references these. Idempotent.
DROP FUNCTION IF EXISTS public.assert_event_active(uuid);
DROP FUNCTION IF EXISTS public.assert_event_editable(uuid);

-- Read helpers are callable by the client (bootstrap / UI gating). The asserting
-- wrappers run inside SECURITY DEFINER write RPCs (as owner) and need no grant.
GRANT EXECUTE ON FUNCTION public.effective_plan_key(uuid)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.plan_allows(uuid, text, int, uuid)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_over_plan(uuid)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.free_event_available(uuid)            TO authenticated;

-- Rollback:
--   DROP FUNCTION public.assert_event_writable(uuid);
--   DROP FUNCTION public.assert_event_activated(uuid);
--   DROP FUNCTION public.free_event_available(uuid);
--   DROP FUNCTION public.assert_within_plan(uuid);
--   DROP FUNCTION public.is_event_over_plan(uuid);
--   DROP FUNCTION public.assert_plan(uuid, text, int, uuid);
--   DROP FUNCTION public.plan_allows(uuid, text, int, uuid);
--   DROP FUNCTION public.effective_plan_key(uuid);
