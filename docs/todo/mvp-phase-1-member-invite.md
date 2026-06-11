# MVP Phase 1 — Member invite link

**Status:** ✅ Done & tested (2026-06-11) — team members join via a single-use
token link (login → claim). Full claim/security matrix verified end-to-end.

## Pending
- **Supabase Auth → "Enable signups" OFF** — the real signup boundary; the
  client-side waitlist throw only mirrors it. Confirm it's off in the dashboard.

## Follow-ups / deferred
### Destroy expired tokens too (added 2026-06-11)
Migration `20260610000102` destroys a token on **use** (NULLs it on claim). An
**expired-but-unclaimed** token is deliberately left in the row — it's already
neutralised by the `invite_expires_at` time-check, the manager UI needs it present
to offer "Regenerate", and a claim can't self-clean it (the `RAISE` rolls the
cleansing `UPDATE` back). To make "the token never persists" total:
1. A `clear_expired_invite_tokens()` sweep (SECURITY DEFINER) nulling
   `invite_token` + `invite_expires_at` where `joined_at IS NULL AND
   invite_expires_at < now()`, scheduled via **pg_cron** (needs the extension on).
2. FE: decouple the "Regenerate" affordance from `member.invite_token` (currently
   gated on it) so an expired member can still regenerate after its token is swept.
Low value — expired tokens are time-gated + 256-bit unguessable; do only for
belt-and-braces.

### Re-enable signup for invited new users
Today a brand-new invitee (no account yet) can't get in — signup is closed
(`signupUser` throws a waitlist error; the join route sends logged-out visitors to
`/login`, token preserved across login ⇄ signup). To open it up, the gate must
check the token is **valid**, not just present (else
`/signup?redirect=/x/join?token=anything` bypasses the waitlist):
1. Turn **"Enable signups" ON** in Supabase Auth (the real boundary).
2. Add a public RPC `is_valid_invite_token(p_token text) → boolean` (SECURITY
   DEFINER; true iff an unclaimed, unexpired invite exists). Anon-callable, leaks
   nothing (256-bit token, boolean only).
3. Signup page: extract the token from the `?redirect=` join URL, call the RPC, and
   only allow the real `auth.signUp` (with `emailRedirectTo` back to the join link)
   when valid — otherwise waitlist / "invalid invite".
4. Re-point the join route's logged-out branch to offer signup again.

### Customizable invite message (template)
The share text is one constant, `INVITE_MESSAGE` in
`src/pages/admin/members/utils.ts` (prepended to the link in `<ShareLink>`). Make
it a **template with placeholders** the inviter can personalize:
> `Hi {{member}}! You've been invited to help plan {{event}}. Join here: {{link}}`
- `{{member}}` → invitee name · `{{event}}` → event name · `{{link}}` → join URL.

Two tiers — ship the cheap one first:
1. **Code default (cheap):** one shared template constant + a tiny
   `renderTemplate(tpl, vars)` helper. No DB, no UI.
2. **Per-event editable (later):** store on **`event_settings`** (all-member
   per-event config; add an `invite_message text` column), edited from event
   settings. No gating needed. NB there is no `event_settings_manager` — it's
   `event_settings`.

**Watch:** escape placeholder output, cap length, fall back to the default when blank.
