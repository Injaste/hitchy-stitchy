-- Migration: per-page RSVP (Step 3C).
-- =============================================================================
-- RSVPs move from per-event to per-page. event_rsvps gains invitation_id (FK ->
-- event_invitations), and UNIQUE(event_id, phone) becomes UNIQUE(invitation_id, phone)
-- so one guest can RSVP to several pages (days/segments) but only once per page.
--
-- The RSVP RPCs that read invitation SETTINGS (deadline / limits / message config)
-- are repointed off the OLD event_invitation (singular) onto the PAGE
-- (event_invitations), and their dedup/capacity is scoped to invitation_id:
--   * submit_rsvp   — signature p_event_id -> p_invitation_id (the page being RSVP'd to);
--                     requires the page to be published; reads settings from it.
--   * update_rsvp   — same keying (event_id + phone + token), but reads settings
--                     from the row's page (v_rsvp.invitation_id); capacity scoped per page.
--   * create_guests — gains p_invitation_id (which page's list); reads limits from it.
--   * update_guest  — reads limits from the row's page; dedup by (invitation_id, phone).
-- delete_invitation gains an RSVP guard (a page with RSVPs can't be deleted).
--
-- UNCHANGED (already correct per-page — token/id-keyed, no per-event settings or
-- dedup): get_rsvp, cancel_rsvp, update_guests, delete_guest. Their guards stand.
--
-- invitation_id is NULLABLE: every new RSVP/guest sets it, but any pre-existing RSVP whose
-- event has no new-model page (old dev data) stays NULL rather than being deleted
-- (non-destructive; NULLS-distinct keeps the unique constraint happy). Tightening to
-- NOT NULL is a go-live cleanup once the old model is purged.
-- =============================================================================

-- 1. invitation_id column + backfill to each event's root (or first-by-date) page. -----
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS invitation_id uuid;

UPDATE public.event_rsvps r
SET invitation_id = (
  SELECT i.id FROM public.event_invitations i
  LEFT JOIN public.event_days d ON d.id = i.day_id
  WHERE i.event_id = r.event_id
  ORDER BY (i.link_slug IS NULL) DESC, d.date ASC NULLS LAST, i.created_at ASC
  LIMIT 1
)
WHERE r.invitation_id IS NULL;

-- 2. FK (RESTRICT: a page with RSVPs is protected, mirroring day_id) + swap the
--    uniqueness from per-event to per-page.
ALTER TABLE public.event_rsvps
  ADD CONSTRAINT event_rsvps_invitation_id_fk
    FOREIGN KEY (invitation_id) REFERENCES public.event_invitations (id) ON DELETE RESTRICT;

ALTER TABLE public.event_rsvps DROP CONSTRAINT event_rsvps_event_id_phone_key;
ALTER TABLE public.event_rsvps
  ADD CONSTRAINT event_rsvps_invitation_id_phone_key UNIQUE (invitation_id, phone);

-- 3. submit_rsvp — now keyed to a page (p_event_id -> p_invitation_id). Reads settings
--    from the page; requires it to be published; dedup/capacity scoped to invitation_id.
--    Guardrails: page exists + published + event active -> name/phone/count required
--    -> deadline -> one-per-page -> private invite-code -> min/max -> capacity ->
--    message-required. (Same set as before, page-scoped.)
DROP FUNCTION IF EXISTS public.submit_rsvp(uuid, jsonb, text);
CREATE OR REPLACE FUNCTION public.submit_rsvp(p_invitation_id uuid, p_fields jsonb, p_invite_code text DEFAULT NULL)
RETURNS event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_inv         event_invitations;
  v_rsvp        event_rsvps;
  v_total       integer;
  v_name        text;
  v_phone       text;
  v_guest_count integer;
  v_message     text;
BEGIN
  SELECT * INTO v_inv FROM event_invitations WHERE id = p_invitation_id;
  IF NOT FOUND OR v_inv.published_at IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;
  IF NOT is_event_active(v_inv.event_id) THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  v_name        := trim(p_fields->>'name');
  v_phone       := regexp_replace(trim(p_fields->>'phone'), '\s+', '', 'g');
  v_guest_count := (p_fields->>'guest_count')::integer;
  v_message     := nullif(trim(p_fields->>'message'), '');

  IF v_name IS NULL OR v_name = '' THEN RAISE EXCEPTION 'Name is required'; END IF;
  IF v_phone IS NULL OR v_phone = '' THEN RAISE EXCEPTION 'Phone number is required'; END IF;
  IF v_guest_count IS NULL THEN RAISE EXCEPTION 'Guest count is required'; END IF;

  IF v_inv.rsvp_deadline IS NOT NULL AND v_inv.rsvp_deadline < now() THEN
    RAISE EXCEPTION 'RSVP deadline has passed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND phone = v_phone AND status != 'cancelled'
  ) THEN
    RAISE EXCEPTION 'You have already submitted an RSVP. Please contact the event organiser for changes';
  END IF;

  IF v_inv.rsvp_mode = 'private' THEN
    IF p_invite_code IS NULL THEN
      RAISE EXCEPTION 'An invite code is required for this event';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM event_rsvps
      WHERE invitation_id = p_invitation_id AND phone = v_phone AND invite_code = p_invite_code AND source = 'private'
    ) THEN
      RAISE EXCEPTION 'Invalid phone number or invite code';
    END IF;
  END IF;

  IF v_guest_count < v_inv.guest_count_min THEN
    RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min;
  END IF;
  IF v_guest_count > v_inv.guest_count_max THEN
    RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max;
  END IF;

  IF v_inv.max_guests IS NOT NULL THEN
    SELECT COALESCE(SUM(guest_count), 0) INTO v_total
    FROM event_rsvps WHERE invitation_id = p_invitation_id AND status != 'cancelled';
    IF v_total + v_guest_count > v_inv.max_guests THEN
      RAISE EXCEPTION 'Sorry, this event has reached maximum capacity';
    END IF;
  END IF;

  IF COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'visible')::boolean, false) THEN
    IF COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'required')::boolean, false) THEN
      IF v_message IS NULL THEN RAISE EXCEPTION 'Message is required'; END IF;
    END IF;
  END IF;

  -- reactivate a cancelled RSVP for this page
  IF EXISTS (
    SELECT 1 FROM event_rsvps
    WHERE invitation_id = p_invitation_id AND phone = v_phone AND status = 'cancelled'
  ) THEN
    UPDATE event_rsvps
    SET name = v_name, guest_count = v_guest_count, message = v_message,
        status = 'confirmed', confirmed_at = now(), cancelled_at = NULL
    WHERE invitation_id = p_invitation_id AND phone = v_phone
    RETURNING * INTO v_rsvp;
    RETURN v_rsvp;
  END IF;

  IF v_inv.rsvp_mode = 'private' THEN
    UPDATE event_rsvps
    SET name = v_name, guest_count = v_guest_count, message = v_message,
        status = 'confirmed', source = 'public', confirmed_at = now()
    WHERE invitation_id = p_invitation_id AND phone = v_phone AND invite_code = p_invite_code
    RETURNING * INTO v_rsvp;
  ELSE
    INSERT INTO event_rsvps (event_id, invitation_id, name, phone, guest_count, message, source, status, confirmed_at)
    VALUES (v_inv.event_id, p_invitation_id, v_name, v_phone, v_guest_count, v_message, 'public', 'confirmed', now())
    RETURNING * INTO v_rsvp;
  END IF;

  RETURN v_rsvp;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_rsvp(uuid, jsonb, text) TO anon, authenticated;

-- 4. update_rsvp — settings from the row's page; capacity scoped to that page.
CREATE OR REPLACE FUNCTION public.update_rsvp(p_event_id uuid, p_phone text, p_token uuid, p_fields jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_inv        event_invitations;
  v_rsvp        event_rsvps;
  v_total       integer;
  v_name        text;
  v_guest_count integer;
  v_message     text;
BEGIN
  IF NOT is_event_active(p_event_id) THEN RAISE EXCEPTION 'Event not found'; END IF;

  p_phone := regexp_replace(p_phone, '\s+', '', 'g');

  SELECT * INTO v_rsvp FROM event_rsvps
  WHERE event_id = p_event_id AND phone = p_phone AND token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'RSVP not found or invalid token'; END IF;
  IF v_rsvp.status = 'cancelled' THEN RAISE EXCEPTION 'Cancelled RSVP cannot be updated'; END IF;

  SELECT * INTO v_inv FROM event_invitations WHERE id = v_rsvp.invitation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_inv.rsvp_deadline IS NOT NULL AND v_inv.rsvp_deadline < now() THEN
    RAISE EXCEPTION 'RSVP deadline has passed';
  END IF;

  v_name        := nullif(trim(p_fields->>'name'), '');
  v_guest_count := (p_fields->>'guest_count')::integer;
  v_message     := nullif(trim(p_fields->>'message'), '');

  IF v_guest_count IS NOT NULL THEN
    IF v_guest_count < v_inv.guest_count_min THEN
      RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min;
    END IF;
    IF v_guest_count > v_inv.guest_count_max THEN
      RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max;
    END IF;
    IF v_inv.max_guests IS NOT NULL THEN
      SELECT COALESCE(SUM(guest_count), 0) INTO v_total
      FROM event_rsvps WHERE invitation_id = v_rsvp.invitation_id AND status != 'cancelled' AND id != v_rsvp.id;
      IF v_total + v_guest_count > v_inv.max_guests THEN
        RAISE EXCEPTION 'Sorry, this event has reached maximum capacity';
      END IF;
    END IF;
  END IF;

  IF COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'visible')::boolean, false) THEN
    IF COALESCE((v_inv.rsvp_config->'rsvp'->'fields'->'message'->>'required')::boolean, false) THEN
      IF v_message IS NULL THEN RAISE EXCEPTION 'Message is required'; END IF;
    END IF;
  END IF;

  UPDATE event_rsvps
  SET name = COALESCE(v_name, name), guest_count = COALESCE(v_guest_count, guest_count), message = v_message
  WHERE id = v_rsvp.id;
END;
$$;

-- 5. create_guests — gains p_invitation_id; limits from the page; dedup/insert per page.
DROP FUNCTION IF EXISTS public.create_guests(uuid, jsonb);
CREATE OR REPLACE FUNCTION public.create_guests(p_event_id uuid, p_invitation_id uuid, p_guests jsonb)
RETURNS SETOF event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_inv   event_invitations;
  v_guest  jsonb;
  v_rsvp   event_rsvps;
  v_phone  text;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'guests', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to create guests';
  END IF;

  SELECT * INTO v_inv FROM event_invitations WHERE id = p_invitation_id AND event_id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found for this event'; END IF;

  FOR v_guest IN SELECT * FROM jsonb_array_elements(p_guests) LOOP
    IF (v_guest->>'name') IS NULL THEN RAISE EXCEPTION 'Each guest must have a name'; END IF;
    v_phone := NULLIF(btrim(v_guest->>'phone'), '');

    IF COALESCE((v_guest->>'guest_count')::integer, 1) < v_inv.guest_count_min THEN
      RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min;
    END IF;
    IF COALESCE((v_guest->>'guest_count')::integer, 1) > v_inv.guest_count_max THEN
      RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max;
    END IF;

    IF v_phone IS NOT NULL AND EXISTS (
      SELECT 1 FROM event_rsvps WHERE invitation_id = p_invitation_id AND phone = v_phone
    ) THEN
      RAISE EXCEPTION 'Guest with phone % already exists', v_phone;
    END IF;

    INSERT INTO event_rsvps (
      event_id, invitation_id, name, phone, guest_count, message,
      source, status, invite_code, confirmed_at, cancelled_at
    )
    VALUES (
      p_event_id, p_invitation_id, v_guest->>'name', v_phone,
      COALESCE((v_guest->>'guest_count')::integer, 1), v_guest->>'message',
      'private', COALESCE((v_guest->>'status')::event_rsvp_status, 'confirmed'),
      upper(substring(md5(random()::text), 1, 6)),
      CASE WHEN COALESCE((v_guest->>'status')::event_rsvp_status, 'confirmed') = 'confirmed' THEN now() ELSE NULL END,
      CASE WHEN (v_guest->>'status')::event_rsvp_status = 'cancelled' THEN now() ELSE NULL END
    )
    RETURNING * INTO v_rsvp;
    RETURN NEXT v_rsvp;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_guests(uuid, uuid, jsonb) TO authenticated;

-- 6. update_guest — limits from the row's page; dedup by (invitation_id, phone).
CREATE OR REPLACE FUNCTION public.update_guest(
  p_event_id uuid, p_id uuid, p_name text DEFAULT NULL, p_phone text DEFAULT NULL,
  p_guest_count integer DEFAULT NULL, p_message text DEFAULT NULL,
  p_status event_rsvp_status DEFAULT NULL, p_invite_code text DEFAULT NULL
)
RETURNS event_rsvps LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_inv   event_invitations;
  v_rsvp   event_rsvps;
  v_phone  text;
BEGIN
  SELECT * INTO v_rsvp FROM event_rsvps WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Guest not found'; END IF;
  IF v_rsvp.event_id != p_event_id THEN RAISE EXCEPTION 'Guest does not belong to this event'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'guests', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to update guests';
  END IF;

  SELECT * INTO v_inv FROM event_invitations WHERE id = v_rsvp.invitation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;

  IF p_guest_count IS NOT NULL THEN
    IF p_guest_count < v_inv.guest_count_min THEN
      RAISE EXCEPTION 'Guest count must be at least %', v_inv.guest_count_min;
    END IF;
    IF p_guest_count > v_inv.guest_count_max THEN
      RAISE EXCEPTION 'Guest count cannot exceed %', v_inv.guest_count_max;
    END IF;
  END IF;

  v_phone := NULLIF(btrim(p_phone), '');
  IF v_phone IS NOT NULL AND v_phone IS DISTINCT FROM v_rsvp.phone THEN
    IF EXISTS (
      SELECT 1 FROM event_rsvps WHERE invitation_id = v_rsvp.invitation_id AND phone = v_phone AND id != p_id
    ) THEN
      RAISE EXCEPTION 'A guest with this phone number already exists';
    END IF;
  END IF;

  UPDATE event_rsvps
  SET name = COALESCE(p_name, name),
      phone = v_phone,
      guest_count = COALESCE(p_guest_count, guest_count),
      message = p_message,
      status = COALESCE(p_status, status),
      invite_code = COALESCE(p_invite_code, invite_code),
      confirmed_at = CASE
        WHEN p_status = 'confirmed'                           THEN now()
        WHEN p_status IS NOT NULL AND p_status != 'confirmed' THEN NULL
        ELSE confirmed_at END,
      cancelled_at = CASE
        WHEN p_status = 'cancelled'                           THEN now()
        WHEN p_status IS NOT NULL AND p_status != 'cancelled' THEN NULL
        ELSE cancelled_at END
  WHERE id = p_id
  RETURNING * INTO v_rsvp;
  RETURN v_rsvp;
END;
$$;

-- 7. delete_invitation — also block a page that has RSVPs (the invitation_id FK is
--    RESTRICT; this surfaces it as a sentence). Re-pastes the current body + block.
CREATE OR REPLACE FUNCTION public.delete_invitation(p_event_id uuid, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_caller event_members; v_inv event_invitations; v_rsvps integer;
BEGIN
  SELECT * INTO v_inv FROM event_invitations WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_inv.event_id != p_event_id THEN RAISE EXCEPTION 'Invitation does not belong to this event'; END IF;

  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN RAISE EXCEPTION 'You are not an active member of this event'; END IF;
  IF NOT has_event_permission(p_event_id, 'invitation', 'delete') THEN
    RAISE EXCEPTION 'Insufficient permission to delete the invitation';
  END IF;

  IF v_inv.published_at IS NOT NULL THEN
    RAISE EXCEPTION 'Published invitation cannot be deleted';
  END IF;

  SELECT count(*) INTO v_rsvps FROM event_rsvps WHERE invitation_id = p_id;
  IF v_rsvps > 0 THEN
    RAISE EXCEPTION 'Remove this page''s % RSVP(s) before deleting it', v_rsvps;
  END IF;

  DELETE FROM event_invitations WHERE id = p_id;
END;
$$;

-- Rollback:
--   (restore submit_rsvp/update_rsvp from 20260613000201; create_guests from
--    20260614000102; update_guest from 20260614000103; delete_invitation from
--    20260615000003; all keyed on event_id)
--   ALTER TABLE public.event_rsvps DROP CONSTRAINT event_rsvps_invitation_id_phone_key;
--   ALTER TABLE public.event_rsvps ADD CONSTRAINT event_rsvps_event_id_phone_key UNIQUE (event_id, phone);
--   ALTER TABLE public.event_rsvps DROP CONSTRAINT event_rsvps_invitation_id_fk;
--   ALTER TABLE public.event_rsvps DROP COLUMN invitation_id;
