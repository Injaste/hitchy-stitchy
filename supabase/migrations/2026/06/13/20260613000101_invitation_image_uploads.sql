-- Migration: Invitation image uploads (Supabase Storage).
-- =============================================================================
-- Adds a single PUBLIC bucket `invitation-images` so couples can upload photos
-- into a theme's image fields (Hero photo, background, OG share image, etc.)
-- instead of pasting a URL. Invitation pages are public to anyone with the slug,
-- so the bucket is public-read (served by the storage CDN via getPublicUrl) —
-- there is no confidentiality to protect, and signed-URL refresh would only add
-- complexity.
--
-- Object path convention (set by the client uploader):
--     invitation-images/<event_id>/<theme_id>/<uuid>.<ext>
-- The first folder segment is the event_id, which the write policies read with
-- storage.foldername(name)[1] to scope authorization to that event.
--
-- WRITES (insert/update/delete) are gated on the SAME permission that gates the
-- update_theme RPC: has_event_permission(event_id, 'themes', 'update') (verified
-- against the live function body — super-admins bypass to true inside
-- has_event_permission; delegated Admins with themes=full pass too).
-- =============================================================================

-- 1) Bucket — public, image MIME allowlist, 5 MB per object. -----------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invitation-images',
  'invitation-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) RLS on storage.objects (already enabled by Supabase). -------------------
--    Public read; writes scoped to the event in the path. DROP-then-CREATE so
--    the file is idempotent on re-run (per migrations README).

DROP POLICY IF EXISTS "invitation_images_read"   ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_update" ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_delete" ON storage.objects;

CREATE POLICY "invitation_images_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'invitation-images');

CREATE POLICY "invitation_images_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'invitation-images'
    AND has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  );

CREATE POLICY "invitation_images_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'invitation-images'
    AND has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  )
  WITH CHECK (
    bucket_id = 'invitation-images'
    AND has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  );

CREATE POLICY "invitation_images_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'invitation-images'
    AND has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  );

-- Rollback:
--   DROP POLICY IF EXISTS "invitation_images_delete" ON storage.objects;
--   DROP POLICY IF EXISTS "invitation_images_update" ON storage.objects;
--   DROP POLICY IF EXISTS "invitation_images_insert" ON storage.objects;
--   DROP POLICY IF EXISTS "invitation_images_read"   ON storage.objects;
--   DELETE FROM storage.buckets WHERE id = 'invitation-images';
--   (empty the bucket's objects first)
