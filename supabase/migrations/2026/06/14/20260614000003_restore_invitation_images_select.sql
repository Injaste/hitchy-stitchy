-- Migration: Restore a (scoped) SELECT policy on invitation-images.
-- =============================================================================
-- 20260614000001 dropped the SELECT policy to stop bucket enumeration. But the
-- client uploads with `upsert: true` (deterministic per-field paths), and an
-- upsert must SELECT to check whether the object already exists — with no SELECT
-- policy that check is denied and the whole upload 403s. (Public image rendering
-- on the invite page is unaffected: it uses getPublicUrl/CDN, no policy.)
--
-- Restore a SELECT policy, tightly scoped — only authenticated event members
-- with theme-edit permission, for this bucket — so the upsert check works
-- WITHOUT broad anon/public enumeration. Named `_select` per the
-- <table>_<operation> policy convention (the original was misnamed `_read`).
-- =============================================================================

-- Drop the legacy misnamed policy if it lingers, plus the target name.
DROP POLICY IF EXISTS "invitation_images_read"   ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_select" ON storage.objects;

CREATE POLICY "invitation_images_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'invitation-images'
    AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  );

-- Re-assert the real INSERT policy, named `_create` per the <table>_<operation>
-- convention (create/select/update/delete). Drops the legacy `_insert` name
-- (from 20260614000002) and the throwaway bucket-only diagnostic that was applied
-- live during debugging.
DROP POLICY IF EXISTS "invitation_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_create" ON storage.objects;

CREATE POLICY "invitation_images_create"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'invitation-images'
    AND public.has_event_permission(((storage.foldername(name))[1])::uuid, 'themes', 'update')
  );

-- Rollback:
--   DROP POLICY IF EXISTS "invitation_images_select" ON storage.objects;
--   DROP POLICY IF EXISTS "invitation_images_create" ON storage.objects;
