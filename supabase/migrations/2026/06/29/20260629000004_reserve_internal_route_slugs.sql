-- Migration: reserve_internal_route_slugs — reserve the /internal staff surface.
-- =============================================================================
-- Append-only follow-up to 20260629000001 (see docs/architecture/reserved-slugs.md).
-- The upcoming staff/support console lives under /internal/** (see
-- docs/todo/support/content-moderation.md). Per THE RULE, reserve those paths
-- before the routes ship so no user slug can ever shadow internal tooling.
--
-- Reserves the namespace itself (internal), the rejected-but-still-dangerous
-- alias (platform/console), and the staff/moderation/ops vocabulary the console
-- will route to. Already-reserved Phase 1 words (admin/staff/support/moderator/
-- dashboard/reports/metrics/root/debug…) are intentionally omitted.
--
-- Same mechanism/sentinel/guards as Phase 1 — pure additive data, no logic change.
-- =============================================================================

INSERT INTO public.slug_reservations (slug, user_id, expires_at)
SELECT DISTINCT s, '00000000-0000-0000-0000-000000000000'::uuid, NULL::timestamptz
FROM unnest(ARRAY[
  -- Namespace + aliases we must never hand out
  'internal','platform','console',
  -- Moderation surface
  'moderation','moderate','flagged','flags','review','reviews','queue','cases',
  -- Staff / ops tooling
  'ops','operations','backoffice','back-office','tools','tooling','manage',
  'management','control','panel','controlpanel','cpanel',
  -- Power / danger
  'god','godmode','sudo',
  -- Support / audit
  'tickets','ticket','escalation','escalations','audit','audits','logs'
]::text[]) AS s
WHERE s ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'
ON CONFLICT (slug) DO UPDATE
  SET user_id = excluded.user_id, expires_at = NULL;

-- Rollback: covered by Phase 1's sentinel-scoped DELETE (removes ALL system
-- reservations). Mirror the array above for surgical removal.
