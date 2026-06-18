-- Migration: Repair leftover invitation-images storage policies after go-live.
-- =============================================================================
-- The go-live cleanup (20260617000008) repointed the invitation-images write
-- policies from the `themes` resource to `invitation`, but it dropped/recreated
-- using the OLD policy name `_insert` — when 20260614000003 had already renamed
-- the INSERT policy to `_create` and added a scoped `_select`. So the cleanup:
--   - created a new, correct `_insert` (gated on `invitation`)  ✅
--   - left `_create`  (INSERT, gated on the now-DELETED `themes` resource)  ❌
--   - left `_select`  (SELECT, gated on the now-DELETED `themes` resource)  ❌
--
-- `_create` is a harmless redundant INSERT (INSERT is OR'd across permissive
-- policies, so writes still pass via `_insert`). But `_select` is the ONLY SELECT
-- policy, and the client uploads with `upsert: true`, which must SELECT to check
-- existence or the upload 403s (the reason `_select` exists). Super-admins pass
-- via the has_event_permission bypass, so it's silent for them — but a delegated
-- admin with `invitation:update` fails uploads, because the SELECT check asks for
-- the dead `themes` permission.
--
-- Fix: drop the stale duplicate INSERT (`_create`), and repoint `_select` to the
-- `invitation` resource. End state = 4 policies (select/insert/update/delete),
-- all gated on has_event_permission(event_id, 'invitation', 'update'), matching
-- the update_invitation RPC.
-- =============================================================================

-- Drop the stale duplicate INSERT policy (gated on the dead `themes` resource).
DROP POLICY IF EXISTS "invitation_images_create" ON storage.objects;

-- Repoint the SELECT policy (needed by upsert) off `themes` onto `invitation`.
DROP POLICY IF EXISTS "invitation_images_select" ON storage.objects;

CREATE POLICY "invitation_images_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'invitation-images'
    AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'invitation', 'update')
  );

-- Rollback:
--   DROP POLICY IF EXISTS "invitation_images_select" ON storage.objects;
--   CREATE POLICY "invitation_images_select" ON storage.objects FOR SELECT TO authenticated
--     USING (bucket_id = 'invitation-images'
--       AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update'));
--   CREATE POLICY "invitation_images_create" ON storage.objects FOR INSERT TO authenticated
--     WITH CHECK (bucket_id = 'invitation-images'
--       AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update'));
