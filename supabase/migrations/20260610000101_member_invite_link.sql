-- Member invite links (MVP Phase 1 — docs/todo/mvp-phase-1-member-invite.md).
--
-- Shifts team-member onboarding from "sign up with the exact invited email, then
-- accept from the dashboard" to a shareable, single-use token link the inviter
-- sends themselves (WhatsApp/SMS). Consequences baked in here:
--   * event_members gains a long invite_token; the link carries the token.
--   * The stored `email` column is DROPPED and email leaves the member read path
--     entirely — invites collect only a display name, and the roster no longer
--     surfaces emails at all.
--   * Passive dashboard discovery (email-match) is removed: get_user_events no
--     longer returns pending invites, and the old accept/reject claim_member_invite
--     is replaced by a token claim. The link is the sole join path.
--   * Links expire 7 days after they're (re)generated; regenerate_member_invite
--     mints a fresh token + resets the clock (revive an expired link / rotate a leak).
--   * event_members.rejected_at is DROPPED — the only thing that set it was the
--     removed decline flow. "Expired" is derived from invited_at, not stored, and
--     removal is now a hard delete. get_bootstrap_context loses its MEMBER_REMOVED
--     branch accordingly.
--
-- These features were not yet live, so this is a clean cutover (no data to
-- preserve, no compat shims). Run order: this file (…000101) runs AFTER
-- 20260610000001_budget_tracker.sql (…000001), which last redefined create_event.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Token + expiry columns. Token is long (256-bit hex), unguessable, unique.
--    invite_expires_at carries the link's deadline so invited_at can stay
--    immutable ("first invited"); regenerate resets the expiry, not invited_at.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.event_members
  ADD COLUMN IF NOT EXISTS invite_token text NOT NULL
    DEFAULT encode(gen_random_bytes(32), 'hex');

ALTER TABLE public.event_members
  ADD COLUMN IF NOT EXISTS invite_expires_at timestamptz NOT NULL
    DEFAULT now() + interval '7 days';

CREATE UNIQUE INDEX IF NOT EXISTS event_members_invite_token_key
  ON public.event_members (invite_token);

-- create_event — EDIT: carries forward the budget-tracker body verbatim; the only
-- change is removing the email handling (the `v_email` var + the email column in
-- the root-member INSERT), since event_members.email is being dropped.
CREATE OR REPLACE FUNCTION public.create_event(p_slug text, p_name text, p_date_start date, p_date_end date, p_display_name text, p_role text)
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
  d           date;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to create an event';
  END IF;

  INSERT INTO events (slug, name, date_start, date_end)
  VALUES (p_slug, p_name, p_date_start, p_date_end)
  RETURNING events.id, events.slug INTO v_event_id, v_slug;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Admin', '{
    "timeline":"full","tasks":"full","guests":"full","invitation":"full",
    "themes":"full","members":"full","access":"read","budget":"full"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_admin_id;

  INSERT INTO event_access_groups (event_id, name, permissions)
  VALUES (v_event_id, 'Team', '{
    "timeline":"full","tasks":"full","members":"read"
  }'::jsonb)
  RETURNING event_access_groups.id INTO v_team_id;

  -- The creator is a fully-joined root member; no email stored.
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

  INSERT INTO event_invitation (event_id) VALUES (v_event_id);
  INSERT INTO event_settings (event_id) VALUES (v_event_id);
  INSERT INTO event_budget (event_id) VALUES (v_event_id);

  -- Seed one day per calendar date in the range, each with a default segment.
  FOR d IN
    SELECT gs::date
    FROM generate_series(p_date_start, p_date_end, interval '1 day') AS gs
  LOOP
    INSERT INTO event_days (event_id, date)
    VALUES (v_event_id, d)
    RETURNING id INTO v_day_id;

    INSERT INTO event_segments (event_id, day_id, name, sort_order)
    VALUES (v_event_id, v_day_id, NULL, 0);
  END LOOP;

  RETURN QUERY
  SELECT v_event_id, v_slug, p_name, p_date_start, p_date_end, false;
END;
$$;

-- invite_member — EDIT: dropped the `p_email` param, the email uniqueness check,
-- and the email column from the INSERT. Invites now carry only a display name;
-- the auto-generated invite_token is the handle. The 2nd-arg signature changed,
-- so the old 6-arg version is dropped before re-creating.
DROP FUNCTION IF EXISTS public.invite_member(uuid, text, text, uuid, text, text);

CREATE OR REPLACE FUNCTION public.invite_member(p_event_id uuid, p_display_name text, p_access_group_id uuid, p_role text DEFAULT NULL::text, p_notes text DEFAULT NULL::text)
RETURNS event_members
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_access_group event_access_groups;
  v_caller       event_members;
  v_result       event_members;
BEGIN
  SELECT * INTO v_access_group
  FROM event_access_groups
  WHERE id = p_access_group_id AND event_id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access group not found in this event';
  END IF;

  v_caller := get_current_member(p_event_id);

  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'members', 'create') THEN
    RAISE EXCEPTION 'Insufficient permission to invite members';
  END IF;

  INSERT INTO event_members (
    event_id, display_name, access_group_id,
    role, notes, invited_at, invited_by
  )
  VALUES (
    p_event_id, p_display_name, p_access_group_id,
    p_role, p_notes, now(), v_caller.id
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- get_members — EDIT: email and user_id leave the read path entirely (email is no
-- longer stored; user_id had no frontend consumer). With both gone the per-row
-- self CASE is unnecessary — the roster basics are shown to all members, audit
-- fields and the share token stay manager-only. v_is_manager = super-admin OR
-- members:update permission (intentionally broader than super-admin).
CREATE OR REPLACE FUNCTION public.get_members(p_event_id uuid)
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_caller     event_members;
  v_is_manager boolean;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  v_is_manager := is_super_admin(v_caller)
    OR has_event_permission(p_event_id, 'members', 'update');

  RETURN COALESCE((
    SELECT json_agg(
      json_build_object(
        -- roster basics — every member
        'id',              m.id,
        'event_id',        m.event_id,
        'access_group_id', m.access_group_id,
        'display_name',    m.display_name,
        'role',            m.role,
        'is_root',         m.is_root,
        'is_bride',        m.is_bride,
        'is_groom',        m.is_groom,
        'joined_at',       m.joined_at,          -- distinguishes active vs pending
        'created_at',      m.created_at,
        'updated_at',      m.updated_at,
        'notes',           m.notes,
        -- audit / moderation — managers only
        'invited_at',      CASE WHEN v_is_manager THEN m.invited_at  ELSE NULL END,
        'invited_by',      CASE WHEN v_is_manager THEN m.invited_by  ELSE NULL END,
        'frozen_at',       CASE WHEN v_is_manager THEN m.frozen_at   ELSE NULL END,
        -- share link — managers, and only while the member is still pending
        'invite_token',      CASE WHEN v_is_manager AND m.joined_at IS NULL THEN m.invite_token      ELSE NULL END,
        'invite_expires_at', CASE WHEN v_is_manager AND m.joined_at IS NULL THEN m.invite_expires_at ELSE NULL END,
        'accessGroup',     CASE WHEN ag.id IS NOT NULL THEN json_build_object(
          'id',          ag.id,
          'event_id',    ag.event_id,
          'name',        ag.name,
          'permissions', ag.permissions,
          'created_at',  ag.created_at,
          'updated_at',  ag.updated_at
        ) ELSE NULL END
      )
      ORDER BY m.created_at ASC
    )
    FROM event_members m
    LEFT JOIN event_access_groups ag ON ag.id = m.access_group_id
    WHERE m.event_id = p_event_id
      -- non-managers never see frozen members
      AND (v_is_manager OR m.frozen_at IS NULL)
  ), '[]'::json);
END;
$$;

-- get_user_events — EDIT: dropped the email-match pending branch (and the
-- is_pending column it fed). With link-only onboarding there is no passive
-- discovery, so only active memberships are returned. Return signature changed,
-- so the old version is dropped before re-creating.
DROP FUNCTION IF EXISTS public.get_user_events();

CREATE FUNCTION public.get_user_events()
RETURNS TABLE(id uuid, slug text, name text, date_start date, date_end date)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT e.id, e.slug, e.name, e.date_start, e.date_end
  FROM event_members em
  JOIN events e ON e.id = em.event_id
  WHERE em.user_id     = auth.uid()
    AND em.joined_at   IS NOT NULL
    AND em.frozen_at   IS NULL
    AND e.deleted_at   IS NULL
  ORDER BY e.date_start DESC;
$$;

-- claim_member_invite — REPLACED: the old (p_event_id, p_action) dashboard
-- accept/reject is gone; the name is reused for the link claim. Finds the pending
-- row by token, attaches the caller, and joins them. Single-use: once joined it
-- can't be re-claimed by anyone else. Open-link by design (decision #1) — whoever
-- holds the token claims the slot. Callers who are already a member are sent
-- straight into the event (returns the slug) instead of erroring. Old (uuid,text)
-- signature dropped first; the new one is OR REPLACE so this file re-runs cleanly.
DROP FUNCTION IF EXISTS public.claim_member_invite(uuid, text);

CREATE OR REPLACE FUNCTION public.claim_member_invite(p_token text)
RETURNS text                              -- the event slug to land on
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_member  event_members;
  v_slug    text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to accept an invite';
  END IF;

  SELECT m.* INTO v_member
  FROM event_members m
  JOIN events e ON e.id = m.event_id
  WHERE m.invite_token = p_token
    AND e.deleted_at IS NULL
  FOR UPDATE OF m;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This invite link is invalid';
  END IF;

  -- Already claimed: idempotent for the same user, rejected for anyone else.
  IF v_member.joined_at IS NOT NULL THEN
    IF v_member.user_id = v_user_id THEN
      SELECT slug INTO v_slug FROM events WHERE id = v_member.event_id;
      RETURN v_slug;
    END IF;
    RAISE EXCEPTION 'This invite has already been claimed';
  END IF;

  -- Links carry their own deadline (invite_expires_at), reset on regenerate.
  IF v_member.invite_expires_at < now() THEN
    RAISE EXCEPTION 'This invite link has expired';
  END IF;

  -- Already an active member of this event (via another row)? Don't create a
  -- second membership — just send them in (the join route redirects on the slug).
  IF EXISTS (
    SELECT 1 FROM event_members
    WHERE event_id = v_member.event_id
      AND user_id  = v_user_id
      AND id <> v_member.id
  ) THEN
    SELECT slug INTO v_slug FROM events WHERE id = v_member.event_id;
    RETURN v_slug;
  END IF;

  UPDATE event_members
  SET user_id = v_user_id, joined_at = now()
  WHERE id = v_member.id;

  SELECT slug INTO v_slug FROM events WHERE id = v_member.event_id;
  RETURN v_slug;
END;
$$;

-- regenerate_member_invite — NEW: mints a fresh token + resets the 7-day clock on
-- a still-pending invite, so a manager can revive an expired/lost link or rotate a
-- leaked one without losing the member's role/notes. Manager-gated, pending only,
-- and rate-limited to once per minute (the token can't be rotated faster than that).
CREATE OR REPLACE FUNCTION public.regenerate_member_invite(p_event_id uuid, p_id uuid)
RETURNS event_members
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller event_members;
  v_member event_members;
  v_result event_members;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF NOT has_event_permission(p_event_id, 'members', 'update') THEN
    RAISE EXCEPTION 'Insufficient permission to manage invites';
  END IF;

  SELECT * INTO v_member
  FROM event_members
  WHERE id = p_id AND event_id = p_event_id AND joined_at IS NULL  -- pending only
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending invite to regenerate';
  END IF;

  -- Rate limit: the link was last issued at (invite_expires_at - 7d); allow one
  -- rotation per minute. invited_at is never touched — it stays "first invited".
  IF v_member.invite_expires_at - interval '7 days' > now() - interval '1 minute' THEN
    RAISE EXCEPTION 'Please wait a minute before regenerating this link';
  END IF;

  UPDATE event_members
  SET invite_token      = encode(gen_random_bytes(32), 'hex'),
      invite_expires_at = now() + interval '7 days'
  WHERE id = p_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- get_bootstrap_context — EDIT: dropped the rejected_at lockout branch (the column
-- is going away; removal is now a hard delete, which already falls through to the
-- generic "not a member" path). Frozen + pending signals unchanged.
CREATE OR REPLACE FUNCTION public.get_bootstrap_context(p_slug text)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_event        events;
  v_member       event_members;
  v_access_group event_access_groups;
BEGIN
  SELECT * INTO v_event
  FROM events WHERE slug = p_slug AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_member
  FROM event_members
  WHERE event_id = v_event.id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  IF v_member.frozen_at IS NOT NULL THEN
    RAISE EXCEPTION 'MEMBER_SUSPENDED: Your access to this event has been suspended';
  END IF;

  IF v_member.joined_at IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  SELECT * INTO v_access_group
  FROM event_access_groups WHERE id = v_member.access_group_id;

  RETURN json_build_object(
    'event_id',   v_event.id,
    'slug',       v_event.slug,
    'event_name', v_event.name,
    'date_start', v_event.date_start,
    'date_end',   v_event.date_end,
    'member', json_build_object(
      'id',           v_member.id,
      'display_name', v_member.display_name,
      'role',         v_member.role,
      'is_root',      v_member.is_root,
      'is_bride',     v_member.is_bride,
      'is_groom',     v_member.is_groom
    ),
    'access_group', json_build_object(
      'id',          v_access_group.id,
      'name',        v_access_group.name,
      'permissions', v_access_group.permissions
    )
  );
END;
$$;

-- Drop the dead columns last, after every function stops referencing them:
--   * email       — no longer stored (link-only invites).
--   * rejected_at — the decline flow that set it is gone; "expired" is derived.
ALTER TABLE public.event_members
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS rejected_at;

-- Rollback (best-effort — dropped email values are NOT recoverable):
--   ALTER TABLE public.event_members ADD COLUMN email text;            -- data lost
--   ALTER TABLE public.event_members ADD COLUMN rejected_at timestamptz;
--   ALTER TABLE public.event_members DROP COLUMN invite_token;
--   Restore the rejected_at branch in get_bootstrap_context from
--   20260604000001_bootstrap_lockout_signals.sql.
--   DROP INDEX IF EXISTS public.event_members_invite_token_key;
--   DROP FUNCTION IF EXISTS public.claim_member_invite(text);
--   DROP FUNCTION IF EXISTS public.regenerate_member_invite(uuid, uuid);
--   Then restore the prior bodies of create_event / invite_member / get_members /
--   get_user_events / claim_member_invite from 20260610000001_budget_tracker.sql,
--   20260605000004_member_email_protection.sql, and the live dump.
