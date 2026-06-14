-- Migration: Make event_rsvps.phone optional (nullable).
-- =============================================================================
-- Admin-added guests may have no phone (e.g. elderly relatives). Drop NOT NULL
-- so they can be created without one. The public RSVP form still requires a
-- phone (enforced in submit_rsvp + the public form).
--
-- The UNIQUE(event_id, phone) constraint STAYS: Postgres treats NULLs as
-- distinct, so unlimited no-phone guests are allowed while real phone numbers
-- remain unique — preserving duplicate-RSVP dedup and the future phone-match
-- private mode.
-- =============================================================================

ALTER TABLE public.event_rsvps ALTER COLUMN phone DROP NOT NULL;

-- Rollback (only valid if no NULL phones exist):
--   ALTER TABLE public.event_rsvps ALTER COLUMN phone SET NOT NULL;
