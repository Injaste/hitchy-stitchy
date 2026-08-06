-- Migration: repoint pre-existing superadmins from Helper to Co-owner
-- =============================================================================
-- Data-only fix, no permission change. Phase 0 (20260805000002) renamed the
-- old single "Admin" group to code='helper' IN PLACE to become today's Helper
-- tier. For any event created BEFORE that migration, the event creator (root)
-- was seeded into that original group at create_event time — so they're still
-- sitting in what's now called Helper, not Co-owner. New events are unaffected
-- (current create_event places the creator in the admin/Co-owner group).
--
-- This is purely cosmetic/structural: is_super_admin (root/bride/groom) bypasses
-- has_event_permission entirely, so their actual power never depended on which
-- group they sat in. access_group_id is NOT NULL, so they've always needed SOME
-- placeholder group — this just corrects it to the more sensible one (Co-owner)
-- to match new events and keep the roster/labels consistent.
-- =============================================================================

UPDATE event_members m
SET access_group_id = a.id
FROM event_access_groups a
WHERE a.event_id = m.event_id
  AND a.code = 'admin'
  AND (m.is_root OR m.is_bride OR m.is_groom)
  AND m.access_group_id IN (
    SELECT id FROM event_access_groups h
    WHERE h.event_id = m.event_id AND h.code = 'helper'
  );

-- Rollback: not meaningful — the prior state (superadmins in Helper) was itself
-- an unintended side effect of Phase 0's rename, not a designed state to restore.
