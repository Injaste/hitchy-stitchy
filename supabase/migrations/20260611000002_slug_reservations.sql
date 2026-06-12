-- Migration: slug_reservations — hold a slug for a user while they fill the
-- =============================================================================
-- create-event wizard, so two people can't race for the same URL. Sliding
-- 30-minute TTL — re-reserving your own slug refreshes the hold (this powers the
-- wizard's near-expiry "Keep it" prompt; no separate refresh RPC). Expiry is
-- lazy — an expired row is ignored by the checks and overwritten on next reserve.
--
-- expires_at IS NULL = a permanent reservation that never expires. Reserved for
-- future system blocklist slugs (e.g. example / test / admin / profanity) seeded
-- up front so no one can ever claim them. Periodic cleanup (pg_cron) only deletes
-- rows with a non-null, past expiry, so permanent rows survive.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.slug_reservations (
  slug       text        NOT NULL,
  user_id    uuid        NOT NULL,
  expires_at timestamptz,                 -- NULL = never expires (system reserved)
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT slug_reservations_pkey PRIMARY KEY (slug)
);

-- RLS on, no policies: reachable only through the SECURITY DEFINER RPCs below
-- (mirrors how every other write path is gated).
ALTER TABLE public.slug_reservations ENABLE ROW LEVEL SECURITY;

-- is_slug_taken — true if ANY event (incl. soft-deleted — they keep their slug
-- under UNIQUE(slug) and may be reinstated) OR an active reservation by SOMEONE
-- ELSE holds the slug. The caller's own reservation never blocks them. A NULL
-- expiry is a permanent reservation. Drives the wizard's availability check.
CREATE OR REPLACE FUNCTION public.is_slug_taken(p_slug text)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events WHERE slug = p_slug
  ) OR EXISTS (
    SELECT 1 FROM public.slug_reservations
    WHERE slug = p_slug
      AND (expires_at IS NULL OR expires_at > now())
      AND user_id IS DISTINCT FROM auth.uid()
  );
$$;

-- reserve_slug — claim (or refresh) a slug for the caller. Sliding: re-reserving
-- your own active slug bumps the TTL by 30 min — that's the "Keep it" action.
-- A different slug releases the prior hold. Raises a single "already taken"
-- whether an event or another user's hold owns it — never reveals which.
CREATE OR REPLACE FUNCTION public.reserve_slug(p_slug text)
RETURNS timestamptz
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user uuid        := auth.uid();
  v_exp  timestamptz := now() + interval '30 minutes';
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to reserve a URL';
  END IF;

  IF p_slug !~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$' THEN
    RAISE EXCEPTION 'Invalid URL slug';
  END IF;

  -- Taken by any event (incl. soft-deleted) OR another user's active reservation
  -- — same message either way, so the holder/state stays anonymous.
  IF EXISTS (
    SELECT 1 FROM public.events WHERE slug = p_slug
  ) OR EXISTS (
    SELECT 1 FROM public.slug_reservations
    WHERE slug = p_slug AND user_id <> v_user
      AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RAISE EXCEPTION 'This URL is already taken';
  END IF;

  -- One in-flight slug per user: drop their previous (non-permanent) hold.
  DELETE FROM public.slug_reservations
  WHERE user_id = v_user AND slug <> p_slug AND expires_at IS NOT NULL;

  INSERT INTO public.slug_reservations (slug, user_id, expires_at)
  VALUES (p_slug, v_user, v_exp)
  ON CONFLICT (slug) DO UPDATE
    SET user_id = excluded.user_id, expires_at = excluded.expires_at
    WHERE slug_reservations.user_id = v_user
       OR (slug_reservations.expires_at IS NOT NULL
           AND slug_reservations.expires_at <= now());

  RETURN v_exp;
END;
$$;

-- release_slug — drop the caller's reservation(s) when they leave the wizard.
-- A no-op if nothing is held.
CREATE OR REPLACE FUNCTION public.release_slug()
RETURNS void
LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM public.slug_reservations WHERE user_id = auth.uid();
$$;

-- Rollback:
-- DROP FUNCTION IF EXISTS public.release_slug();
-- DROP FUNCTION IF EXISTS public.reserve_slug(text);
-- DROP FUNCTION IF EXISTS public.is_slug_taken(text);
-- DROP TABLE IF EXISTS public.slug_reservations;
