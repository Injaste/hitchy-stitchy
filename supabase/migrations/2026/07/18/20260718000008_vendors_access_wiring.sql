-- Migration: vendors access wiring — RLS, catalog, backfill
-- =============================================================================
-- The non-function half of the delegation: move reads off the super-admin bypass
-- onto the delegated 'vendors' resource, list it in the resource catalog so the
-- access matrix shows it, and grant existing Admin groups the same full access
-- that create_event now seeds for new events.
-- =============================================================================

-- 1) RLS — reads follow the delegated resource. has_event_permission short-
--    circuits TRUE for super-admins, so the couple still sees everything.
DROP POLICY IF EXISTS event_vendors_select ON public.event_vendors;

CREATE POLICY event_vendors_select ON public.event_vendors
  FOR SELECT TO authenticated
  USING (has_event_permission(event_id, 'vendors', 'read'));

-- 2) Resource catalog — list `vendors` so the access matrix can render it.
--    Idempotent.
INSERT INTO public.event_resources (resource)
SELECT 'vendors'
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_resources WHERE resource = 'vendors'
);

-- 3) Backfill existing Admin groups — full vendor access, matching the seed in
--    create_event. Idempotent; Team is intentionally left without the key.
UPDATE public.event_access_groups
SET permissions = permissions || '{"vendors":"full"}'::jsonb
WHERE name = 'Admin' AND NOT (permissions ? 'vendors');

-- Rollback:
--   UPDATE event_access_groups SET permissions = permissions - 'vendors' WHERE permissions ? 'vendors';
--   DELETE FROM event_resources WHERE resource = 'vendors';
--   DROP POLICY event_vendors_select ON public.event_vendors;
--   CREATE POLICY event_vendors_select ON public.event_vendors
--     FOR SELECT TO authenticated USING (is_super_admin_member(event_id));
