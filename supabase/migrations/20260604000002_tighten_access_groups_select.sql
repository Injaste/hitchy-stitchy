-- Migration: tighten event_access_groups SELECT policy
--
-- Current policy has two branches:
--   1. is_super_admin_member(event_id)  — superadmins see all groups
--   2. EXISTS (... em.access_group_id = event_access_groups.id)
--      — members can see only their own group row, with no joined_at/frozen_at check
--
-- Problems:
--   - Frozen/rejected members can still read their own group row.
--   - Regular members can only read their own group, so joining access-group
--     names onto other members' cards would fail for non-superadmins.
--
-- Fix: replace with is_event_member(event_id) which uses get_current_member()
-- internally (joined_at IS NOT NULL AND frozen_at IS NULL). Active members can
-- read all group rows, which allows the members-list join to display group names
-- on each member card regardless of the viewer's own group.
--
-- Trade-off: active members can read other groups' permission config.
-- For a collaborative event-planning app this is acceptable; the UI already
-- shows the access matrix to all members in read-only mode.

DROP POLICY IF EXISTS event_access_groups_select ON event_access_groups;

CREATE POLICY event_access_groups_select ON event_access_groups
  FOR SELECT
  TO authenticated
  USING (is_event_member(event_id));

-- Optional (run separately if desired):
-- Verify event_members has REPLICA IDENTITY FULL for realtime field-diffing:
--   ALTER TABLE event_members REPLICA IDENTITY FULL;
--
-- Scope event_resources to event members (currently qual = true for all authenticated):
--   DROP POLICY IF EXISTS event_role_permissions_select ON event_resources;
--   CREATE POLICY event_role_permissions_select ON event_resources
--     FOR SELECT TO authenticated USING (true);  -- leave as-is, or scope as needed

-- Rollback:
-- DROP POLICY IF EXISTS event_access_groups_select ON event_access_groups;
-- CREATE POLICY event_access_groups_select ON event_access_groups
--   FOR SELECT TO authenticated
--   USING (
--     is_super_admin_member(event_id) OR (
--       EXISTS (
--         SELECT 1 FROM event_members em
--         WHERE em.user_id = auth.uid()
--           AND em.event_id = event_access_groups.event_id
--           AND em.access_group_id = event_access_groups.id
--       )
--     )
--   );
