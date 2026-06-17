-- Go-live cleanup: retire the old single-page invitation model + themes resource.
-- =============================================================================
-- Production runs on the new per-(day, segment) event_invitations model (RPC
-- cutover: 20260617000007). These are the remaining drops. RUN TOGETHER WITH the
-- frontend deploy that stops reading the old surfaces (event_invitation,
-- event_templates.slug, the `themes` access resource) — same coordinated ship as
-- the cutover.
--
-- Order matters: repoint image-upload auth off `themes` BEFORE removing the
-- resource; trim create_event BEFORE dropping event_invitation; drop dependent
-- functions before their tables.
-- =============================================================================

-- 1) Invitation-image storage policies — repoint write auth from the retiring
--    `themes` resource to `invitation` (uploads now gated on invitation=update,
--    which the couple/Admins already hold). Read policy is unchanged (public).
DROP POLICY IF EXISTS "invitation_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_update" ON storage.objects;
DROP POLICY IF EXISTS "invitation_images_delete" ON storage.objects;

CREATE POLICY "invitation_images_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invitation-images'
    AND has_event_permission(((storage.foldername(name))[1])::uuid, 'invitation', 'update'));
CREATE POLICY "invitation_images_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'invitation-images'
    AND has_event_permission(((storage.foldername(name))[1])::uuid, 'invitation', 'update'))
  WITH CHECK (bucket_id = 'invitation-images'
    AND has_event_permission(((storage.foldername(name))[1])::uuid, 'invitation', 'update'));
CREATE POLICY "invitation_images_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'invitation-images'
    AND has_event_permission(((storage.foldername(name))[1])::uuid, 'invitation', 'update'));

-- 2) create_event — drop the legacy `INSERT INTO event_invitation` seed and the
--    `"themes":"full"` grant from the Admin access group. Body is otherwise the
--    current definition verbatim.
CREATE OR REPLACE FUNCTION public.create_event(
  p_slug         text,
  p_name         text,
  p_days         jsonb,
  p_display_name text,
  p_role         text
)
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date, is_pending boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_event_id  uuid;
  v_slug      text;
  v_admin_id  uuid;
  v_team_id   uuid;
  v_member_id uuid;
  v_day_id    uuid;
  v_start     date;
  v_end       date;
  rec         record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  IF p_days IS NULL OR jsonb_array_length(p_days) = 0 THEN
    RAISE EXCEPTION 'Select at least one event day';
  END IF;

  IF is_slug_taken(p_slug) THEN
    RAISE EXCEPTION 'This URL is already taken' USING ERRCODE = 'unique_violation';
  END IF;

  SELECT min((d->>'date')::date), max((d->>'date')::date)
  INTO v_start, v_end
  FROM jsonb_array_elements(p_days) AS d;

  INSERT INTO events (slug, name)
  VALUES (p_slug, p_name)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  -- No budget grant — budget is super-admin only (the couple), enforced by the
  -- RPCs/RLS. The `budget` resource stays in the catalog for discovery.
  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "members":"full","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"read","members":"read","access":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

  INSERT INTO event_members (
    event_id, user_id, display_name, access_group_id,
    role, is_root, is_bride, is_groom, invited_at, joined_at
  )
  VALUES (
    v_event_id, v_user_id, p_display_name, v_admin_id,
    p_role, true, (p_role = 'Bride'), (p_role = 'Groom'), now(), now()
  )
  RETURNING event_members.id INTO v_member_id;

  UPDATE events SET created_by = v_member_id WHERE events.id = v_event_id;

  INSERT INTO event_settings (event_id) VALUES (v_event_id);
  -- (no event_budget seed — buckets are lazy, per day)

  FOR rec IN
    SELECT DISTINCT ON (dt) dt AS date, lbl AS label
    FROM (
      SELECT (d->>'date')::date              AS dt,
             btrim(COALESCE(d->>'label', '')) AS lbl
      FROM jsonb_array_elements(p_days) AS d
    ) s
    ORDER BY dt
  LOOP
    IF rec.label = '' THEN
      RAISE EXCEPTION 'Each event day needs a label';
    END IF;

    INSERT INTO event_days (event_id, date, label)
    VALUES (v_event_id, rec.date, rec.label)
    RETURNING event_days.id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);
  END LOOP;

  DELETE FROM slug_reservations WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, v_start, v_end, false;
END;
$$;

-- 3) Drop the dormant theme RPCs (the `themes` admin route redirects to
--    /invitation; nothing calls these). By-name loop so overloads go too.
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT oid::regprocedure AS sig FROM pg_proc
    WHERE proname IN ('create_theme', 'update_theme', 'publish_theme', 'delete_theme')
  LOOP EXECUTE 'DROP FUNCTION ' || r.sig::text; END LOOP;
END $$;

-- 4) Drop the old tables — superseded by event_invitations (plural). CASCADE
--    clears their own policies/triggers/indexes (nothing else FKs into them).
DROP TABLE IF EXISTS public.event_themes CASCADE;
DROP TABLE IF EXISTS public.event_invitation CASCADE;

-- 5) Remove the `themes` resource: catalog row + strip the key from every
--    existing access group's permissions.
DELETE FROM public.event_resources WHERE resource = 'themes';
UPDATE public.event_access_groups
  SET permissions = permissions - 'themes'
  WHERE permissions ? 'themes';

-- 6) Drop event_templates.slug — superseded by template_key (the FE now reads
--    template_key, seeded equal to slug in 20260615000002).
ALTER TABLE public.event_templates DROP COLUMN IF EXISTS slug CASCADE;

-- Rollback: non-trivial — recreate the dropped tables/RPCs from the dump and
-- re-add the slug column + themes resource. Take a DB snapshot before running.
