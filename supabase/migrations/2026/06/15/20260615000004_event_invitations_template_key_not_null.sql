-- Migration: event_invitations.template_key NOT NULL.
-- =============================================================================
-- template_key shipped nullable in …0001 (mirroring event_themes.template_id, a
-- nullable FK). But template_key is a plain code-registry string with NO FK that
-- could null it, and create_invitation always sets it — so an invitation never
-- legitimately lacks a template. Tighten to NOT NULL. Safe: every row is created
-- through create_invitation with a key (no null rows exist).
-- =============================================================================

ALTER TABLE public.event_invitations
  ALTER COLUMN template_key SET NOT NULL;

-- Rollback:
--   ALTER TABLE public.event_invitations ALTER COLUMN template_key DROP NOT NULL;
