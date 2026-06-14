-- Migration: Schema-qualify has_event_permission in invitation-images policies.
-- =============================================================================
-- The write policies (20260613000101) referenced `has_event_permission(...)`
-- unqualified. Policies on storage.objects evaluate WITHOUT `public` in the
-- search_path, so the unqualified function didn't resolve and uploads failed
-- with "new row violates row-level security policy". Qualifying it as
-- `public.has_event_permission(...)` fixes resolution. storage.foldername was
-- already qualified. Behaviour is otherwise identical.
-- =============================================================================

DROP POLICY IF EXISTS "invitation_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_update" ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_delete" ON storage.objects;

CREATE POLICY "invitation_images_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'invitation-images'
    AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  );

CREATE POLICY "invitation_images_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'invitation-images'
    AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  )
  WITH CHECK (
    bucket_id = 'invitation-images'
    AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  );

CREATE POLICY "invitation_images_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'invitation-images'
    AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  );

-- Rollback: recreate the three policies with the unqualified function name
-- (the broken state) — see 20260613000101 for the original bodies.
