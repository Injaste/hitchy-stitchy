# Launch TODO

Things intentionally deferred until after beta. Each item should have enough context to action cold.

## Members & Access

### Outbound member invites / onboarding
**Status:** deferred (beta). **Today:** `invite_member` only inserts an `event_members` row; the invitee discovers the invite *only* if they independently sign up with the exact email entered, then accept it from their dashboard's pending-invites list. There is no email or link sent.

**At launch, pick one (or both):**
- **Shareable invite link** — generate a token/code; the inviter sends it themselves (WhatsApp/SMS/email). Invitee opens link → signs up → auto-linked. No email infrastructure needed; needs a token column + a small claim RPC.
- **Outbound email invites** — system emails the invite automatically. Needs an email provider (e.g. Resend/Postmark) + an edge function. Ongoing cost.

Until then, the in-app pending UX shows a hint + copy-email button (superadmins only) so the organizer can tell the person which email to sign up with.
