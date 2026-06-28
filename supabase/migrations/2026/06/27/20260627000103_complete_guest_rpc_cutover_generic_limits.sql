-- Migration: complete the guest/RSVP plan-gate cutover + generic limit messages
-- =============================================================================
-- Migration 20260618000109 built GATED successors (create_guest, submit_rsvp_v2,
-- update_invitation_v2, update_guest_v2) but left the original v1s in place for a
-- later cutover that never happened — so the FE still called the UNGATED v1s and
-- the guest cap could be exceeded via the admin "Add guest" path (and a page's
-- max_guests wasn't clamped to the plan cap on save). This finishes the cutover:
--
--   1) drop the 4 ungated v1 functions (verified drop-in: same arg signatures), and
--   2) rename the *_v2 successors to the base names the FE already calls.
--
-- submit_rsvp / update_invitation / update_guest keep their base names, so the FE
-- is unchanged for those. create_guest keeps ITS canonical name (from 109); the one
-- FE call still on the old create_guest_on_pages is repointed to create_guest.
-- RENAME preserves grants (incl. submit_rsvp's anon grant for the public RSVP page).
--
-- Also: make the limit/feature messages GENERIC — no tier name ("Pro"), no
-- resource-specific wording. (The public RSVP path keeps its own guest-friendly
-- "reached maximum capacity" message — it never says "upgrade".)
--
-- One transaction: if any signature is off, the whole thing rolls back untouched.
-- After applying, smoke-test E2E: add/edit a guest, save + publish an invitation,
-- submit a public RSVP.
-- =============================================================================

BEGIN;

-- 1) Drop the ungated originals.
DROP FUNCTION public.create_guest_on_pages(uuid, uuid[], jsonb);
DROP FUNCTION public.submit_rsvp(uuid, jsonb, text);
DROP FUNCTION public.update_invitation(
  uuid, uuid, text, jsonb, event_rsvp_mode, timestamptz, integer, integer,
  integer, text, jsonb, text, boolean
);
DROP FUNCTION public.update_guest(
  uuid, uuid, text, text, integer, text, event_rsvp_status, uuid
);

-- 2) Promote the *_v2 successors to the base names (grants carry over). create_guest
--    already has its canonical name — the FE repoints to it (no rename needed).
ALTER FUNCTION public.submit_rsvp_v2(uuid, jsonb, text)
  RENAME TO submit_rsvp;
ALTER FUNCTION public.update_invitation_v2(
  uuid, uuid, text, jsonb, event_rsvp_mode, timestamptz, integer, integer,
  integer, text, jsonb, text, boolean
) RENAME TO update_invitation;
ALTER FUNCTION public.update_guest_v2(
  uuid, uuid, text, text, integer, text, event_rsvp_status, uuid
) RENAME TO update_guest;

-- 3) Generic limit/feature messages (tier-agnostic). Body unchanged from
--    20260618000104 except the message CASE.
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
    CASE
      WHEN p_resource IN ('budget', 'gifts', 'branding')
        THEN 'This isn''t included in your plan. Upgrade your plan to use it.'
      ELSE 'You''ve reached your plan''s limit. Upgrade your plan for more.'
    END
    USING ERRCODE = 'check_violation';
END;
$$;

COMMIT;

-- Rollback: this consolidates names; reversing means recreating the v1 bodies
-- (see 20260618000009) + renaming the gated ones back to *_v2 / create_guest, and
-- re-pasting 20260618000104's assert_plan message CASE.
