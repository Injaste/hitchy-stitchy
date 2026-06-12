-- Invalidate invite tokens once consumed (MVP Phase 1 follow-up —
-- docs/todo/mvp-phase-1-member-invite.md).
--
-- Hardening: a single-use invite token is a bearer credential that rides in a URL
-- (browser history, Referer headers, chat logs). The prior design left the token
-- string in the row after the invite was claimed — inert ONLY because
-- claim_member_invite guards on joined_at. That's a single layer: a future code
-- path, an RLS slip, or a leaked dump/backup resurrects every used token. This
-- destroys the secret the moment it's spent, keeping joined_at as the audit marker.
--
--   * invite_token / invite_expires_at become NULLable. The existing unique index
--     event_members_invite_token_key still holds: a btree unique index treats
--     NULLs as distinct, so any number of spent (NULL) rows coexist.
--   * Backfill: NULL the token on every already-joined row. NB create_event stamps
--     the root/creator member with joined_at AND a default invite_token, so every
--     event already carries at least one persisted, now-pointless token.
--   * claim_member_invite NULLs invite_token + invite_expires_at on a successful
--     claim.
--
-- Scope — EXPIRED-but-unclaimed tokens are deliberately retained: they're already
-- neutralised by the invite_expires_at time-check, the manager UI needs the token
-- present to offer "Regenerate", and a claim can't self-clean an expired token (the
-- RAISE would roll the cleansing UPDATE back). Rotating a leaked link is
-- regenerate's job. Run order: after 20260610000101_member_invite_link.sql.

-- 1) Allow the columns to be emptied once the token is spent.
ALTER TABLE public.event_members ALTER COLUMN invite_token      DROP NOT NULL;
ALTER TABLE public.event_members ALTER COLUMN invite_expires_at DROP NOT NULL;

-- 2) Destroy tokens already persisted on joined rows (root/creator members + any
--    member who joined under the old keep-the-token logic). Pending rows keep
--    their live token so the link still works / can be regenerated.
UPDATE public.event_members
SET invite_token = NULL, invite_expires_at = NULL
WHERE joined_at IS NOT NULL
  AND invite_token IS NOT NULL;

-- claim_member_invite — EDIT: on a successful claim, NULL invite_token +
-- invite_expires_at so the spent credential no longer lives in the row. The old
-- idempotent "same user re-claims → return slug" and "already claimed by someone
-- else → raise" branches are folded into one defensive guard: once spent, the
-- token is gone, so a re-click finds no row and returns 'invalid' (the join page
-- routes them to the dashboard). The joined_at guard now only blocks the
-- impossible "a live token sits on a joined row" case rather than overriding the
-- owner. FOR UPDATE OF m still serialises concurrent claims; the loser's
-- locked-row re-check sees invite_token = NULL (≠ p_token) and is rejected.
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

  -- Defensive: a live token must only ever sit on a pending row (claiming NULLs
  -- it). If that invariant is ever violated, reject rather than override the owner.
  IF v_member.joined_at IS NOT NULL THEN
    RAISE EXCEPTION 'This invite has already been claimed';
  END IF;

  -- Links carry their own deadline (invite_expires_at), reset on regenerate.
  IF v_member.invite_expires_at < now() THEN
    RAISE EXCEPTION 'This invite link has expired';
  END IF;

  -- Already an active member of this event (via another row)? Don't create a
  -- second membership, and don't consume this invite — just send them in.
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
  SET user_id           = v_user_id,
      joined_at         = now(),
      invite_token      = NULL,        -- spent: destroy the bearer credential
      invite_expires_at = NULL
  WHERE id = v_member.id;

  SELECT slug INTO v_slug FROM events WHERE id = v_member.event_id;
  RETURN v_slug;
END;
$$;

-- Rollback (best-effort — destroyed token values are NOT recoverable):
--   Restore the prior claim_member_invite body from
--   20260610000101_member_invite_link.sql (kept the token; had the idempotent
--   same-user and 'already claimed' branches).
--   Re-impose NOT NULL (only AFTER refilling — the old values are gone):
--     UPDATE public.event_members SET invite_token = encode(gen_random_bytes(32),'hex')
--       WHERE invite_token IS NULL;
--     UPDATE public.event_members SET invite_expires_at = now() + interval '7 days'
--       WHERE invite_expires_at IS NULL;
--     ALTER TABLE public.event_members ALTER COLUMN invite_token      SET NOT NULL;
--     ALTER TABLE public.event_members ALTER COLUMN invite_expires_at SET NOT NULL;
