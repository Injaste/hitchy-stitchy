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

## Events & Days

### Reconcile `event_days` when an event's date range is edited
**Status:** deferred — no event-edit path exists yet. **Context:** the day/segment spine (migration `20260608000001`) seeds `event_days` + a default `event_segments` row **only at `create_event`**. There is intentionally **no trigger** keeping days in sync with the date range, so editing an event's `date_start`/`date_end` later will NOT adjust days on its own.

**When event editing is built, the date-change handler (in `update_event`) must:**
- **Adding days** (range extended) — seed the new `event_days` rows + a default segment each (same loop as `create_event`). Safe, do automatically.
- **Shortening** (range reduced) — **never silently delete** days. The trigger/RPC stays add-only; deletion is always an explicit, confirmed user action. The edit UI should warn when out-of-range days hold content ("Day 3 has 5 timeline items…") and let the user keep / move-to-another-day / confirm-delete. Only *truly empty* out-of-range days (default segment, zero items, and — later — zero check-ins/guests/etc.) are safe to auto-clean.

## Performance / Bundle

### Vendor chunk splitting is inert under Vite 8 / Rolldown
**Status:** deferred (acceptable for now — most users have decent internet). **Today:** `vite.config.ts` `manualChunks` returns names like `vendor-motion` / `vendor-supabase` / `vendor-tanstack` / `vendor-ui` / `vendor-react`, but Rolldown (the Vite 8 bundler) doesn't emit them from the function-form `manualChunks`. Only the `vendor-libs` catch-all materializes; the big libs collapse into `page-admin` (~2.1 MB) and `shared` (~205 KB). So returning visitors re-download vendor code per route instead of hitting a cached vendor chunk.

**Fix when it matters:** migrate the vendor groupings to Rolldown's `output.advancedChunks` (the supported API). The route-based src rules (`page-home` / `page-auth` / `page-dashboard` / `page-admin` / `shared`) DO work and can stay. The inert vendor rules are kept in the config with a NOTE comment so the intent isn't lost.

### Admin chunk size (~2.1 MB)
**Status:** deferred — fine for now (good-internet assumption). When it grows: split `page-admin` by sub-route (timeline / tasks / members / guests / invitation / settings), each lazy-loaded, and land the vendor split above so libs aren't bundled into it.

## Plans & Monetization

### "Remove branding" (Advanced) is advertised but not wired
**Status:** deferred (intentional). **Today:** `can_remove_branding` is a real plan flag (Advanced-only) and is sold in the upgrade modal as an unlock (`PLAN_FEATURES` + `feature-meta`), but **nothing consumes it**. The only persistent guest-facing brand is the "Made with Hitchy Stitchy" footer in `src/pages/wedding/form/RSVPForm.tsx` (~L220–231), shown unconditionally on every tier; `get_public_invitation` (the anon guest-page RPC) doesn't even emit the flag. So an Advanced buyer who pays to remove branding still sees it.

**Why deferred:** the founder's own public event runs on Advanced and we *want* the Hitchy Stitchy brand shown there for marketing — so removing it isn't a priority, and it's harmless pre-launch (no other Advanced customers yet).

**When built:**
- BE: `get_public_invitation` (current body = migration `20260628000101`) emits `remove_branding` = `can_remove_branding` for the event's effective plan.
- FE: thread it via a small `RemoveBrandingContext` provided once in `src/pages/wedding/index.tsx` (do **not** prop-drill through the 9 templates that each render `<RSVPForm>` via `useRsvpSection`), consumed in `RSVPForm` to gate the footer. Map the field in `wedding/api.ts` + `wedding/types.ts`.

**Interim caveat:** until built, the modal advertises a non-functional perk. If a paying Advanced customer other than the founder appears before it's wired, either build it or drop `branding` from `PLAN_FEATURES` so it isn't sold (same call we made for the phantom `max_expenses` / `max_gifts` caps).
