-- Sweep spent invite tokens off expired-unclaimed invites (MVP Phase 1 follow-up —
-- docs/todo/mvp-phase-1-member-invite.md).
--
-- Background: an invite_token is a 256-bit bearer credential that rides in a URL
-- (browser history, Referer, chat logs). 20260610000102 already destroys it the
-- moment it's CLAIMED. The one case it deliberately left behind is an
-- EXPIRED-but-unclaimed token: a claim can't self-clean it (the expiry RAISE rolls
-- the cleansing UPDATE back), so the string lingers in the row — inert only because
-- claim_member_invite guards on invite_expires_at. This makes "the token never
-- persists" total by nulling it on a schedule once the link is past its deadline.
--
-- SCOPE — NULLs invite_token ONLY, NOT invite_expires_at:
--   * invite_token is the sole secret; nulling it is the whole security goal.
--   * invite_expires_at is NOT a credential — it's the timestamp the frontend uses
--     to derive "expired" vs "pending" (getMemberStatus). Nulling it would silently
--     downgrade every swept member to "pending" across the roster + home showcase.
--     So it stays: the row keeps reading as "expired", and a manager can still
--     Regenerate (regenerate_member_invite only needs joined_at IS NULL).
--   This diverges from the claim path (which NULLs both) on purpose — a claimed
--   member is "active" and needs neither column; an expired one still needs the
--   timestamp to render correctly.
--
-- Low value on its own — expired tokens are already time-gated AND 256-bit
-- unguessable — so this is belt-and-braces. Requires pg_cron (already used by
-- 20260611000004_slug_reservations_cron). Run order: after
-- 20260610000102_invalidate_invite_token_on_use.sql.

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- clear_expired_invite_tokens — NEW: housekeeping purge. NULLs the spent token on
-- every expired, still-unclaimed invite. Keeps invite_expires_at so the row still
-- derives as "expired" and stays regenerable. `invite_token IS NOT NULL` skips
-- rows already swept (no churn).
CREATE OR REPLACE FUNCTION public.clear_expired_invite_tokens()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.event_members
  SET invite_token = NULL
  WHERE joined_at IS NULL
    AND invite_token IS NOT NULL
    AND invite_expires_at IS NOT NULL
    AND invite_expires_at < now();
$$;
REVOKE EXECUTE ON FUNCTION public.clear_expired_invite_tokens() FROM PUBLIC, anon, authenticated;

-- (Re)schedule daily at 18:00 UTC (02:00 SGT, off-peak). Unschedule first so
-- re-running is idempotent.
DO $$
BEGIN
  PERFORM cron.unschedule('clear-expired-invite-tokens');
EXCEPTION WHEN OTHERS THEN
  NULL;  -- not scheduled yet
END $$;

SELECT cron.schedule(
  'clear-expired-invite-tokens',
  '0 18 * * *',
  $$ SELECT public.clear_expired_invite_tokens(); $$
);

-- Rollback:
-- SELECT cron.unschedule('clear-expired-invite-tokens');
-- DROP FUNCTION IF EXISTS public.clear_expired_invite_tokens();
