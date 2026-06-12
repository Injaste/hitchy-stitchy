-- Migration: slug_reservations cleanup — periodic purge of expired holds.
-- =============================================================================
-- OPTIONAL / housekeeping only. Correctness does NOT depend on this: the
-- reserve/availability checks already ignore expired rows and overwrite them
-- (lazy expiry). This just stops the table accumulating dead rows over time.
--
-- Requires the pg_cron extension. On Supabase, enable it once under
-- Database → Extensions (or the CREATE EXTENSION below if your role allows it),
-- then paste-run this file. Skip the whole file if you'd rather not use pg_cron.
--
-- Permanent reservations (expires_at IS NULL — future system blocklist slugs)
-- are never touched: the delete is scoped to non-null, past expiries.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Delete only expired, non-permanent holds.
CREATE OR REPLACE FUNCTION public.cleanup_expired_slug_reservations()
RETURNS void
LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM public.slug_reservations
  WHERE expires_at IS NOT NULL AND expires_at < now();
$$;

-- (Re)schedule every 30 minutes. Unschedule first so re-running is idempotent.
DO $$
BEGIN
  PERFORM cron.unschedule('slug-reservations-cleanup');
EXCEPTION WHEN OTHERS THEN
  NULL;  -- not scheduled yet
END $$;

SELECT cron.schedule(
  'slug-reservations-cleanup',
  '*/30 * * * *',
  $$ SELECT public.cleanup_expired_slug_reservations(); $$
);

-- Rollback:
-- SELECT cron.unschedule('slug-reservations-cleanup');
-- DROP FUNCTION IF EXISTS public.cleanup_expired_slug_reservations();
