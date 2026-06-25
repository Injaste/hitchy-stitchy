# Payments & Plans — Remaining Execution (E)

**Status:** 🟡 Foundation live; payment rail + bespoke service outstanding.
**Source of truth** for the remaining payments work. The plan catalog, per-event
plan flip, guard functions, write-RPC gating, entitlements-in-bootstrap, `usePlan()`,
and the bespoke *delivery* mechanism are **already built and merged** — they are not
restated here as tasks. This doc carries only what is left to build.

> Supersedes the open items in `execution-plan.md`. Strategy rationale still lives in
> `phase-1.md`; decisions settled since are locked below.

---

## Foundation already live (do not rebuild)

Grounding only — so an execution chat doesn't redo it:

- `plans` versioned catalog + `events.plan_key` / `events.activated_at` (pin model).
- Guard functions: `assert_event_writable`, `plan_allows`, `assert_plan`,
  `is_event_over_plan`, `free_event_available`, two-cap guests.
- Write RPCs gated (days / segments / pages / members / budget / gifts / rsvp / guest + locks).
- `event_purchases` ledger **table** (Stripe lifecycle enum, idempotency key, refund cols) — exists, **unused**.
- `get_bootstrap_context` returns plan + limits + usage; `usePlan()` + `plan-config` + billing UI/modals.
- Bespoke **delivery**: `event_templates.event_id` + scoped `get_templates` (a private template shows only in its event's picker).

The funnel-gap from earlier notes is **closed** — ~20 templates are seeded (Muslim,
Chinese, Indian families), so premium themes is a real Pro lever, not a content hole.

---

## Locked decisions (this round)

- **Two ledgers, one rail.** Plan purchases keep flipping `events.plan_key` via
  `event_purchases`. Bespoke is a **separate** event-scoped ledger, **`event_services`**
  (sibling to `event_purchases`). They share a single checkout + webhook, branching on
  `metadata.kind`. Bespoke is **not** a plan flip.
- **Naming.** `event_services` follows the schema convention: `event_*` = a table
  scoped to one event (`event_id` FK, per-event RLS). A `service_key text` column
  (only `'bespoke_invitation'` today) keeps it extensible without a services *catalog*
  table — resolve the Stripe price server-side from the key.
- **Prices (SGD, launch — change later via a new plan version, never by editing a sold row):**
  - **Pro:** **S$99** one-time, per event.
  - **2nd-event activation (Free tier):** **S$50**. The 1st free event is the $0
    allowance (born active, never touches Stripe); the $50 is the `free` plan's price
    for a 2nd+ event.
  - **Bespoke invitation:** **S$250** one-off service.
- **PayNow is asynchronous.** PayNow settles *after* the session completes — the
  webhook must handle `checkout.session.async_payment_succeeded` /
  `async_payment_failed`, not only `checkout.session.completed`. The UI needs a
  "payment processing" state between submit and settle.
- **Live-RPC stop-gate.** Any change to a live RPC's signature/body is a hard
  stop-and-confirm. All grant logic here is **new, additive** RPCs and edge functions.

---

## Execution chats (split by dependency, not one-per-step)

- **Chat A — Phase 1:** E1 + E2 (SKUs + `event_services` table). Additive DB groundwork.
- **Chat B — Phase 2:** E3 (shared rail: checkout fn + webhook + grant RPC). Needs A.
- **Chat C — Phase 3:** E4 (bespoke intake + fulfillment surface). Needs A + B.
- **Cleanup:** E5 (cron, receipts read-RPC, `schema.sql` sync, legal). Fold in where it lands.

---

## Phase 1 (Chat A) — SKUs + `event_services`

Both pieces are purely additive: no live RPC touched, no live data at risk.

### E1 — Provision Stripe SKUs
- Stripe account live with **card + PayNow**, currency **SGD**.
- Create Price objects: **Pro S$99**, **Free-activation S$50**, **Bespoke S$250**.
- Migration fills the current `plans` rows' NULL `stripe_price_id` / `price`
  (`pro` → 99, `free` → 50). This **completes provisioning** of the current versions
  before anything sells — it is *not* mutating sold terms, so it stays within the
  immutability rule. Bespoke's SKU is resolved from `service_key` in E2/E3, not stored in `plans`.
- **Verify:** `select tier, version, is_current, price, stripe_price_id from plans` →
  pro=99 and free=50, both with a `stripe_price_id`.

### E2 — `event_services` table + intake RPC
- New event-scoped ledger, sibling to `event_purchases`. Doubles as **intake + order +
  fulfillment tracker** (one row per service purchase).
- Columns: `event_id` FK, `service_key text` (`'bespoke_invitation'`), the design
  brief — `brief_style` / `brief_colours` / `brief_context` / `brief_vision` (required) +
  `reference_template_key` / `brief_references` (optional), mirroring the FE
  `bespokeFormSchema` — Stripe fields mirroring `event_purchases`
  (`stripe_checkout_session_id` UNIQUE for idempotency, `amount`, `currency`, `status`),
  `fulfilled_at`. Status lifecycle `requested → paid → fulfilled → delivered` **(expands
  for the revision loop — see Phase 3)**.
- RLS: read gated by **invitation access** — `is_event_member(event_id) AND
  has_event_permission(event_id,'invitation','read')` (whoever can see invitations sees
  the request + status); **no client writes** — the service role (webhook) and a SECURITY
  DEFINER RPC are the only writers (same posture as `event_purchases`).
- `submit_bespoke_request` RPC (authed; **super-admin** of the event — `is_super_admin`)
  validates the four required brief fields and inserts the `requested` row. **Plan-bounded:**
  open bespoke requests draw from the invitation-page allowance — `existing pages + open
  bespoke requests ≤ max_invitation_pages` (reuse `assert_plan(event,'pages',1)`), so a
  Free event gets one and Pro up to its cap. **No** `assert_event_writable` (bespoke is
  plan-independent). New RPC — additive.
- **Verify:** a non-owner cannot read another event's request; a root member can submit;
  status defaults to `requested`; `npm run build`.

> The bespoke **entitlement needs no runtime flag** — `get_templates` already gates by
> `event_id`, so "delivery" is the manual scoped-row insert in E4, nothing the client reads.

---

## Phase 2 (Chat B) — Shared payment rail *(outline — expand on go)*

- `create-checkout-session` edge fn: authn JWT → assert root → resolve SKU by
  `metadata.kind` (`plan` / `bespoke`) → session with `['card','paynow']`, SGD,
  `metadata:{ event_id, kind, plan_key | service_id }` → return hosted URL.
- `stripe-webhook` edge fn (service role; pattern from `supabase/functions/send-timeline-push`):
  verify signature → handle `checkout.session.completed`, `async_payment_succeeded`,
  `async_payment_failed`, `charge.refunded`, `charge.dispute.created`.
- **One SECURITY DEFINER `record_purchase` RPC** (authored as a migration) does the
  idempotent verify (price_id == catalog, amount, currency) + grant, branching on kind:
  `plan` → write `event_purchases` + flip `events.plan_key` / `activated_at`;
  `bespoke` → mark the `event_services` row `paid`.
- **Refund / dispute** (`charge.refunded` / `charge.dispute.created`) → set
  `event_purchases.status = refunded | disputed` AND **re-pend the event**
  (`activated_at = NULL`) so the existing activation gate re-locks it (admin +
  public). Nothing is deleted — paying restores everything. Extend `ActivationModal`
  to branch copy by reason (never-paid → "complete payment" vs reversed → "payment
  reversed — restore"); no separate RepayModal.
- Return flow: success URL → refetch bootstrap so the lock lifts without reload;
  PayNow "processing" interim state.
- **No-surprise checkout (paid-event disclosure)** *(ported from old execution-plan.md
  Phase C)*: the create-event wizard shows the price up front (e.g. "New event · S$50")
  and the user acknowledges before building; a pending 2nd+ event saves as a draft framed
  as "Activate [Event]", never sprung after the work.

## Phase 3 (Chat C) — Bespoke surface *(open design — expand on go)*

> **Bespoke is an *iterative commissioned service*, not pay-and-deliver.** The intake form
> is **built but hidden** behind `BESPOKE_ENABLED` (`false`) in
> `src/pages/admin/invitation/components/bespoke.ts` until the flow below is settled —
> re-render the hub card, browse-sheet card, and modal by flipping the flag to `true`.

- **Intake** — the brief form (style / colours / ceremony-context / vision + optional
  reference-template + inspiration links) → checkout via the shared rail. *Built; gated off.*
- **Communication channel (couple ↔ us)** — the request can't be fire-and-forget. The
  couple needs to track status, receive each **proof**, and send **one consolidated round
  of feedback** at a time. Implies a request **detail view** + storage for proofs and
  feedback — likely a child table (e.g. `event_service_revisions`) + an asset bucket for
  proofs. *(Design TBD.)*
- **Bounded revisions** — **2 rounds of consolidated feedback included** in the S$250;
  further rounds are paid extra. This is the **scope/legal grounding** (what S$250 buys)
  and **must be disclosed before payment** (modal + checkout + ToS).
- **Lifecycle expands** beyond `requested → paid → fulfilled → delivered` — add the design
  loop, e.g. `… paid → in_design → proof_sent → revising (round n) → delivered`, with a
  revision counter capped by the included rounds (keep the `event_purchase_status`-style
  enum).
- **Fulfillment / delivery** stays **manual, no new infra**: author the template
  component, insert the `event_templates` row scoped to the `event_id`, mark the
  `event_services` row `delivered`. Delivery gating already works via `get_templates`.

## Cleanup (E5) *(outline)*

- Abandoned-pending cron: sweep `events WHERE activated_at IS NULL AND created_at <
  now() - grace`, with a heads-up before removal (mirrors the slug-reservations cron).
- Real receipts: a gated `get_event_purchases` read-RPC unioning both ledgers → replaces
  the placeholder rows in the billing UI.
- Sync `supabase/schema.sql` (one pass). Legal pages live (fair-use + refund — Stripe
  activation requires them).
- Downgrade-completeness lock sweep *(ported from old execution-plan.md Phase B)*: the
  remaining `update_*` RPCs (tasks / timeline / …) get `assert_event_writable` so a
  suspended / over-limit event is fully read-only (create/update blocked, delete open).

---

## Guardrails

- `schema.sql` + `migrations/` are source of truth; every backend change = a timestamped
  migration. Never call an unconfirmed RPC.
- `useAccess()` / `usePlan()` are client UX gates; **RLS + RPCs are the real boundary.**
- Reuse feature-folder structure + primitives. `npm run build` before marking done. No
  `console.log` / TODO / commented code in commits.
