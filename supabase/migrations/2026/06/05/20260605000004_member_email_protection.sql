-- Migration: route all member reads through a single gated RPC
--
-- The roster was readable directly by every active member (RLS = is_event_member),
-- which exposed email and left two read paths. We collapse to ONE controlled path:
--   1. get_members() RPC (SECURITY DEFINER) is the sole read path. It returns the
--      roster with email only for managers (superadmin or members:full) — plus your
--      own email always.
--   2. Scope the direct SELECT policy to your OWN row (user_id = auth.uid()), so
--      the roster LIST can only be read via the gated RPC — but your own row stays
--      directly readable. That keeps realtime (postgres_changes) working for live
--      self-resync without exposing anyone else's row. The SECURITY DEFINER
--      functions read as the owner and are unaffected.
--
-- Bonus: unlike the old is_event_member policy (which hid your row once frozen),
-- a plain user_id match has no status filter — so your own freeze/removal now
-- arrives via realtime and locks you out instantly. The roster list (other members'
-- changes) refreshes on focus/navigation, which is fine.

CREATE OR REPLACE FUNCTION public.get_members(p_event_id uuid)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_caller     event_members;
  v_is_manager boolean;
BEGIN
  v_caller := get_current_member(p_event_id);
  IF v_caller.id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this event';
  END IF;

  -- Managers = superadmin or members:full. They see the full roster + all fields;
  -- everyone else gets a collaborator view (see field/row tiering below).
  v_is_manager := is_super_admin(v_caller)
    OR has_event_permission(p_event_id, 'members', 'update');

  RETURN COALESCE((
    SELECT json_agg(
      json_build_object(
        -- roster basics — everyone
        'id',              m.id,
        'event_id',        m.event_id,
        'access_group_id', m.access_group_id,
        'display_name',    m.display_name,
        'role',            m.role,
        'is_root',         m.is_root,
        'is_bride',        m.is_bride,
        'is_groom',        m.is_groom,
        'joined_at',       m.joined_at,          -- needed to tell active vs pending
        'created_at',      m.created_at,
        'updated_at',      m.updated_at,
        'notes',           m.notes,              -- coordination: everyone reads, only managers write
        -- personal — self or manager only
        'email',           CASE WHEN v_is_manager OR m.id = v_caller.id THEN m.email       ELSE NULL END,
        'user_id',         CASE WHEN v_is_manager OR m.id = v_caller.id THEN m.user_id     ELSE NULL END,
        -- audit / moderation — managers only
        'invited_at',      CASE WHEN v_is_manager THEN m.invited_at  ELSE NULL END,
        'invited_by',      CASE WHEN v_is_manager THEN m.invited_by  ELSE NULL END,
        'frozen_at',       CASE WHEN v_is_manager THEN m.frozen_at   ELSE NULL END,
        'rejected_at',     CASE WHEN v_is_manager THEN m.rejected_at ELSE NULL END,
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
      -- non-managers never see frozen/rejected members at all
      AND (v_is_manager OR (m.frozen_at IS NULL AND m.rejected_at IS NULL))
  ), '[]'::json);
END;
$$;

-- Direct reads are now own-row only; the roster list goes through get_members().
DROP POLICY IF EXISTS event_members_select ON public.event_members;
CREATE POLICY event_members_select ON public.event_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
