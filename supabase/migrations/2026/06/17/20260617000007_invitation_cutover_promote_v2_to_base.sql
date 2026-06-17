-- Go-live cutover: promote the _v2 RPCs to the canonical base names.
-- =============================================================================
-- Production is now on the new per-(day, segment) model and the live page is
-- served by the *_v2 bodies. This DROPS the dormant old-model base functions and
-- RENAMES the _v2 functions onto the base names — a pure rename, so the verified
-- bodies move across untouched (no transcription, no behaviour change).
--
-- RUN THIS TOGETHER WITH DEPLOYING the frontend that calls the base names: the
-- rename removes the _v2 names, so the currently-deployed (_v2-calling) frontend
-- must flip to the base names at the same time. There is no _v2 fallback after.
--
-- Plain DROP (no CASCADE): if anything still depends on an old body the DROP
-- errors out rather than silently cascading. DO-guards make it idempotent — the
-- rename only fires while the _v2 function still exists.
--
-- Model-agnostic RPCs (get_rsvp, cancel_rsvp, update_guests, delete_guest) were
-- never branched and keep their names.
-- =============================================================================

-- get_public_invitation(text, text) — same signature, swap to the new body.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_public_invitation_v2') THEN
    DROP FUNCTION IF EXISTS public.get_public_invitation(text, text);
    ALTER FUNCTION public.get_public_invitation_v2(text, text) RENAME TO get_public_invitation;
  END IF;
END $$;

-- submit_rsvp(uuid, jsonb, text) — old was event-keyed; new is invitation-keyed.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'submit_rsvp_v2') THEN
    DROP FUNCTION IF EXISTS public.submit_rsvp(uuid, jsonb, text);
    ALTER FUNCTION public.submit_rsvp_v2(uuid, jsonb, text) RENAME TO submit_rsvp;
  END IF;
END $$;

-- update_rsvp(uuid, text, uuid, jsonb) — same signature, swap to the new body.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_rsvp_v2') THEN
    DROP FUNCTION IF EXISTS public.update_rsvp(uuid, text, uuid, jsonb);
    ALTER FUNCTION public.update_rsvp_v2(uuid, text, uuid, jsonb) RENAME TO update_rsvp;
  END IF;
END $$;

-- create_guests — old was (uuid, jsonb); new is (uuid, uuid, jsonb) (+ invitation).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_guests_v2') THEN
    DROP FUNCTION IF EXISTS public.create_guests(uuid, jsonb);
    ALTER FUNCTION public.create_guests_v2(uuid, uuid, jsonb) RENAME TO create_guests;
  END IF;
END $$;

-- update_guest(...8 args) — same signature, swap to the new body.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_guest_v2') THEN
    DROP FUNCTION IF EXISTS public.update_guest(uuid, uuid, text, text, integer, text, event_rsvp_status, text);
    ALTER FUNCTION public.update_guest_v2(uuid, uuid, text, text, integer, text, event_rsvp_status, text) RENAME TO update_guest;
  END IF;
END $$;

-- Grants survive RENAME (privileges hang off the function oid); re-assert for clarity.
GRANT EXECUTE ON FUNCTION public.get_public_invitation(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_rsvp(uuid, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_rsvp(uuid, text, uuid, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_guests(uuid, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_guest(uuid, uuid, text, text, integer, text, event_rsvp_status, text) TO authenticated;

-- Rollback: re-run 20260617000004 + 20260617000005 (restore old base bodies),
-- then 20260617000006 (recreate the _v2 functions).
