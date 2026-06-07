# Launch TODO

Things intentionally deferred until after beta. Each item should have enough context to action cold.

## Members & Access

### Outbound member invites / onboarding
**Status:** deferred (beta). **Today:** `invite_member` only inserts an `event_members` row; the invitee discovers the invite *only* if they independently sign up with the exact email entered, then accept it from their dashboard's pending-invites list. There is no email or link sent.

**At launch, pick one (or both):**
- **Shareable invite link** — generate a token/code; the inviter sends it themselves (WhatsApp/SMS/email). Invitee opens link → signs up → auto-linked. No email infrastructure needed; needs a token column + a small claim RPC.
- **Outbound email invites** — system emails the invite automatically. Needs an email provider (e.g. Resend/Postmark) + an edge function. Ongoing cost.

Until then, the in-app pending UX shows a hint + copy-email button (superadmins only) so the organizer can tell the person which email to sign up with.

## Auth / Signup

### Signup success "Go to Dashboard" destination
**Status:** deferred until signup is fully enabled (today `signupUser` early-returns and the home signup links are commented out — pre-launch waitlist mode). **Issue:** the signup success screen (`src/auth/sign-up/index.tsx`, the "Account created! Check your inbox" branch) has a **"Go to Dashboard"** button → `/dashboard`. A just-signed-up user isn't authenticated yet (must confirm email first), so `AuthGate` bounces `/dashboard` → `/login` — the button promises "dashboard" but delivers "login". **When enabling signup:** relabel to "Continue to login" (or drop the CTA and lean on the "check your inbox" copy) and decide the post-confirmation flow.

## Performance / Bundle

### Vendor chunk splitting is inert under Vite 8 / Rolldown
**Status:** deferred (acceptable for now — most users have decent internet). **Today:** `vite.config.ts` `manualChunks` returns names like `vendor-motion` / `vendor-supabase` / `vendor-tanstack` / `vendor-ui` / `vendor-react`, but Rolldown (the Vite 8 bundler) doesn't emit them from the function-form `manualChunks`. Only the `vendor-libs` catch-all materializes; the big libs collapse into `page-admin` (~2.1 MB) and `shared` (~205 KB). So returning visitors re-download vendor code per route instead of hitting a cached vendor chunk.

**Fix when it matters:** migrate the vendor groupings to Rolldown's `output.advancedChunks` (the supported API). The route-based src rules (`page-home` / `page-auth` / `page-dashboard` / `page-admin` / `shared`) DO work and can stay. The inert vendor rules are kept in the config with a NOTE comment so the intent isn't lost.

### Admin chunk size (~2.1 MB)
**Status:** deferred — fine for now (good-internet assumption). When it grows: split `page-admin` by sub-route (timeline / tasks / members / guests / invitation / settings), each lazy-loaded, and land the vendor split above so libs aren't bundled into it.
