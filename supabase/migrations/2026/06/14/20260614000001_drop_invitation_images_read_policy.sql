-- Migration: Drop the public SELECT policy on invitation-images storage objects.
-- =============================================================================
-- The `invitation_images_read` SELECT policy (added in 20260613000101) let any
-- client LIST/enumerate every object in the public `invitation-images` bucket
-- via the storage list API — broader exposure than intended (flagged by the
-- Supabase security advisor).
--
-- A PUBLIC bucket already serves individual objects over the CDN via
-- getPublicUrl WITHOUT any SELECT policy, and the app only ever reads images by
-- their public URL — it never lists the bucket. So the policy is unnecessary;
-- removing it closes the enumeration hole. The insert/update/delete policies
-- (gated on has_event_permission(... 'themes','update')) are unaffected.
-- =============================================================================

DROP POLICY IF EXISTS "invitation_images_read" ON storage.objects;

-- Rollback:
--   CREATE POLICY "invitation_images_read" ON storage.objects
--     FOR SELECT TO public USING (bucket_id = 'invitation-images');
