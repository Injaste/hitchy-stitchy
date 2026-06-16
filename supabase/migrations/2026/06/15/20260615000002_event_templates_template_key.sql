-- Migration: event_templates.template_key — additive registry-key column.
-- =============================================================================
-- The invitation redesign reserves `slug` for the EVENT and identifies templates
-- by `template_key` (the code-registry key). Add it ADDITIVELY and seed it from
-- the existing `slug` (same values today). The old `slug` column stays untouched
-- and is dropped only at the go-live cleanup. Idempotent.
-- =============================================================================

ALTER TABLE public.event_templates
  ADD COLUMN IF NOT EXISTS template_key text;

UPDATE public.event_templates
  SET template_key = slug
  WHERE template_key IS NULL;

-- Rollback:
--   ALTER TABLE public.event_templates DROP COLUMN template_key;
