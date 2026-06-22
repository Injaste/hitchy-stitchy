-- Migration: profiles.avatar_url + avatars storage bucket
-- =============================================================================
-- A global profile picture (one per account, not per event). Stored in a PUBLIC
-- `avatars` bucket — read by anyone with the URL (served off the storage CDN via
-- getPublicUrl, no confidentiality to protect), but every WRITE is owner-only.
--
-- Object path convention (set by the client uploader):
--     avatars/<auth.uid()>/avatar.<ext>
-- The first folder segment is the owner's auth uid, which the write policies read
-- with storage.foldername(name)[1] to scope create/update/delete to that user.
--
-- profiles.avatar_url holds the resulting public URL; it is written only through
-- the update_profile_avatar RPC (SECURITY DEFINER, own row), keeping the column
-- in step with the table's RPC-only write model. Additive; no shared RPC touched.
-- Same feature as 20260621000001 (run after it).
-- =============================================================================

-- ── avatar_url column ──────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- ── bucket: public, image allowlist, 5 MB per object ───────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── RLS on storage.objects: public read; owner-only writes ─────────────────────
-- DROP-then-CREATE so the file is idempotent on re-run (per migrations README).
DROP POLICY IF EXISTS "avatars_read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;

CREATE POLICY "avatars_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND ((storage.foldername(name))[1])::uuid = auth.uid()
  );

CREATE POLICY "avatars_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND ((storage.foldername(name))[1])::uuid = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND ((storage.foldername(name))[1])::uuid = auth.uid()
  );

CREATE POLICY "avatars_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND ((storage.foldername(name))[1])::uuid = auth.uid()
  );

-- ── update_profile_avatar: the only client write path for avatar_url ───────────
-- New: saves the uploaded object's public URL onto the caller's own profile
-- (auth.uid()). NULL clears it (avatar removed). The storage object itself is
-- governed by the policies above; this only moves the pointer column.
CREATE OR REPLACE FUNCTION public.update_profile_avatar(p_avatar_url text)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles
     SET avatar_url = NULLIF(btrim(p_avatar_url), ''),
         updated_at = now()
   WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.update_profile_avatar(text) TO authenticated;

-- Rollback:
--   DROP FUNCTION IF EXISTS public.update_profile_avatar(text);
--   DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
--   DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
--   DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
--   DROP POLICY IF EXISTS "avatars_read"   ON storage.objects;
--   DELETE FROM storage.buckets WHERE id = 'avatars';   -- (empty its objects first)
--   ALTER TABLE public.profiles DROP COLUMN IF EXISTS avatar_url;
