-- Retire the dead per-row invite_code column + the now-unused create_guests RPC.
-- =============================================================================
-- invite_code was the OLD private-RSVP unlock key (a per-guest code matched with
-- the phone). Private mode now gates on the per-PAGE shared code
-- (event_invitations.private_code) + phone, so the per-row code is never read —
-- not by submit_rsvp, not by get_public_invitation, not shown anywhere.
--
-- create_guests (many guests -> ONE page) also lost its last caller: the create
-- flow moved to create_guest_on_pages (one guest -> many pages, atomic) and the
-- CSV import was removed. So it's dead too.
--
-- The column's other writers were already updated to stop referencing it:
-- update_guest (20260618000003) and create_guest_on_pages (20260618000004).
-- create_guests is the final reference — dropped here — then the column is
-- dropped. submit_rsvp never touched it.
--
-- NOTE: the PUBLIC submit_rsvp(p_invite_code) arg is UNRELATED — it carries the
-- guest-typed page code, and stays.
-- =============================================================================

-- The original many-guests-one-page insert — superseded by create_guest_on_pages.
DROP FUNCTION IF EXISTS public.create_guests(uuid, uuid, jsonb);

-- No writers left — drop the column. Plain DROP (no CASCADE) surfaces any
-- unexpected dependency rather than silently cascading.
ALTER TABLE public.event_rsvps DROP COLUMN invite_code;

-- Rollback:
--   ALTER TABLE public.event_rsvps ADD COLUMN invite_code text;
--   (restore create_guests from 20260617000006 if a bulk path is ever revived)
