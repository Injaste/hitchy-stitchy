# MVP Phase 1 — Member invite link

**Goal:** an invited team member can actually join the event from a link the
inviter shares (WhatsApp/SMS). Correctness fix, not a new feature surface.

**Why now:** today `invite_member` only inserts an `event_members` row keyed by
email. The invitee finds it **only** if they independently sign up with the exact
same email, then accept from the dashboard's pending-invites list — no link or
email is sent ([launch.md](launch.md) "Outbound member invites"). That quietly
breaks team-building, which everything downstream (tasks/timeline assignees,
vendors, ang bao helper roles) depends on. This is the "shareable invite link"
option from launch.md — no email infra needed.

## Scope
1. **Shareable invite link + claim** for team members.
2. **WhatsApp / copy-link share** buttons for: the invite link, the public
   **invitation** link, and the **RSVP** link (the cross-cutting SG glue — cheap,
   do it here).

Out of scope: outbound *email* invites (needs a provider — defer per launch.md).

## Backend
- **Verify first:** a `claim_member_invite` RPC may already exist (it's on the
  schema's "to add from dump" list, marked *if exists*). Grep migrations +
  `schema.sql`. Extend it rather than duplicate.
- Add `invite_token uuid NOT NULL DEFAULT gen_random_uuid()` (unique) to
  `event_members` — the link carries the token, not the email.
- `claim_member_invite(p_token uuid)` `SECURITY DEFINER`: find the unclaimed row
  (`invite_token = p_token AND user_id IS NULL AND joined_at IS NULL AND
  rejected_at IS NULL`), set `user_id = auth.uid()`, `joined_at = now()`. Reject
  if already claimed / rejected / event soft-deleted. Returns the event slug to
  redirect to.
- Timestamped migration + `schema.sql` sync.

## Frontend
- A join route — `/:slug/join?token=…` (or `/join/:token`) — that: if not logged
  in, routes through signup/login preserving the token; once authed, calls
  `claim_member_invite`, then redirects to `/:slug/admin`. Reuse the
  redirect-sanitize pattern in [`auth.md`](../architecture/auth.md).
- In the members invite modal (`src/pages/admin/members/modals/`), after invite,
  surface the share link with **copy** + **WhatsApp** (`https://wa.me/?text=…`)
  buttons. Keep the existing copy-email hint as fallback.
- Reusable share control — check `src/components/custom/` first; build a small
  `ShareLink` only if none exists.

## Dependency — signup must be on
Invite-link onboarding assumes a new user can sign up. Today signup is in
**waitlist mode** (`signupUser` early-returns; home signup links commented out —
[launch.md](launch.md) "Auth / Signup"). Either enable signup for invited users,
or scope the link to already-registered accounts for beta. **Decide before build.**

## Tier
Free (core collaboration).

## Complexity
Low–medium. One column + one RPC + a claim route + share buttons.

## Open decisions
1. **Email match** — require the claimer's auth email to match the invited email
   (tighter, but the inviter must know their exact login email), or open-link
   (anyone with the link claims that slot — simpler, WhatsApp-friendly, standard).
   Leaning open-link with a single-use token.
2. **Token lifecycle** — expiry? revoke-on-reinvite? regenerate on demand?
3. **Signup gating** (see Dependency) — enable general signup, or invited-only for beta.

## Grounding
- `invite_member` + members modals: `src/pages/admin/members/`.
- Pending-invites accept flow: `src/pages/dashboard/` (JoinedCard / InvitedCard).
- Auth/redirect: `src/auth/`, [`auth.md`](../architecture/auth.md).
- Recipe + guardrails: [mvp-overview.md](mvp-overview.md).
