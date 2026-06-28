-- Migration: hard server feature-gates (timeline / tasks / members)
-- =============================================================================
-- Bug 2: the client gates the timeline/tasks/members pages (RequirePlan), but the
-- server didn't enforce the FEATURE itself — a direct RPC or table write could use
-- a locked feature (e.g. create_task succeeded on a Plus event). Close it at the
-- TABLE level with BEFORE INSERT/UPDATE triggers, so every write path — including
-- the SECURITY DEFINER RPCs, which bypass RLS — is gated by the event's plan.
--
-- Rule: you can CREATE or EDIT a feature's data only if your current plan includes
-- it. DELETE is never gated — it's the cleanup valve, so a downgraded event can
-- still remove its now-locked data. No upgrade/downgrade detection: the trigger
-- just checks the current plan at write time, so a downgrade naturally freezes the
-- lost feature (create/edit blocked, delete allowed) and an upgrade unlocks it.
--
-- Exemptions (writable on EVERY plan): the NULL-name default segment and root
-- members (seeded at event/day creation, so creation keeps working), PLUS the
-- couple (is_bride/is_groom) — a product rule: Starter/Plus get couple management
-- (name the bride & groom) while collaborator invites stay gated. Verified:
-- create_event seeds is_root members + NULL-name segments; create_day seeds a
-- NULL-name segment.
--
-- access needs NO trigger — event_access_groups has only a SELECT RLS policy, so
-- user writes are already denied; groups exist solely via create_event seeding
-- (SECURITY DEFINER, which bypasses RLS). It's already hard-gated.
-- =============================================================================

BEGIN;

-- Current plan's feature flags. Separate from plan_allows (which owns the numeric
-- caps + the budget/gifts/branding asserts) — and avoids the 'members' key clash
-- (plan_allows('members') is the member-COUNT cap; this is the member FEATURE).
-- SECURITY DEFINER so the trigger reads plans regardless of who's writing.
CREATE OR REPLACE FUNCTION public.plan_has_feature(p_event_id uuid, p_feature text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT CASE p_feature
    WHEN 'timeline' THEN can_use_timeline
    WHEN 'tasks'    THEN can_use_tasks
    WHEN 'members'  THEN can_use_members
    WHEN 'access'   THEN can_use_access
    WHEN 'budget'   THEN can_use_budget
    WHEN 'gifts'    THEN can_use_gifts
    WHEN 'branding' THEN can_remove_branding
    ELSE false
  END
  FROM plans WHERE key = effective_plan_key(p_event_id);
$$;

-- BEFORE INSERT/UPDATE gate. TG_ARGV[0] = the feature key for the table.
CREATE OR REPLACE FUNCTION public.enforce_plan_feature()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Structural, seeded-on-every-plan rows stay writable so event/day creation works.
  IF TG_TABLE_NAME = 'event_segments' THEN
    IF NEW.name IS NULL THEN RETURN NEW; END IF;          -- the default segment
  ELSIF TG_TABLE_NAME = 'event_members' THEN
    -- The couple are plan-exempt principals (not gated collaborators): every tier
    -- can name root + bride + groom, so Starter/Plus get couple management.
    IF NEW.is_root OR NEW.is_bride OR NEW.is_groom THEN RETURN NEW; END IF;
  END IF;

  IF NOT plan_has_feature(NEW.event_id, TG_ARGV[0]) THEN
    RAISE EXCEPTION 'This isn''t included in your plan. Upgrade your plan to use it.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

-- Attach to each feature table (INSERT/UPDATE only — DELETE is the cleanup valve).
DROP TRIGGER IF EXISTS plan_gate_tasks ON public.event_tasks;
CREATE TRIGGER plan_gate_tasks BEFORE INSERT OR UPDATE ON public.event_tasks
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_feature('tasks');

DROP TRIGGER IF EXISTS plan_gate_timelines ON public.event_timelines;
CREATE TRIGGER plan_gate_timelines BEFORE INSERT OR UPDATE ON public.event_timelines
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_feature('timeline');

-- Named segments are the timeline structure; the NULL-name default is exempt above.
DROP TRIGGER IF EXISTS plan_gate_segments ON public.event_segments;
CREATE TRIGGER plan_gate_segments BEFORE INSERT OR UPDATE ON public.event_segments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_feature('timeline');

-- Inviting/managing collaborators; the couple (root + bride/groom) is exempt above.
DROP TRIGGER IF EXISTS plan_gate_members ON public.event_members;
CREATE TRIGGER plan_gate_members BEFORE INSERT OR UPDATE ON public.event_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_feature('members');

COMMIT;

-- Rollback: DROP TRIGGER plan_gate_tasks/timelines/segments/members on their tables;
-- DROP FUNCTION public.enforce_plan_feature(); DROP FUNCTION public.plan_has_feature(uuid, text);
