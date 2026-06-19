# Payments & Plans — Execution Plan

**Status:** 🟡 In progress — DB foundation (Phase A) written, not yet paste-run.
**Branch:** `feat/subscription-plans`
**Scope:** Single-event, one-time-payment product line (Free + Pro). The
planner/agency subscription line is **out of scope** (a later product; this
architecture leaves room for it but builds nothing for it).

> Supersedes the open decisions in [`phase-1.md`](phase-1.md) (the strategy
> snapshot). The Free/Pro line, caps, lock behaviour, and Stripe choice
> below are **locked**. Advanced tier and vendor day-gating are **dropped from
> v1** — revisit when those features exist.

---

## Locked decisions

- **Billing unit:** one-time payment, **per event**. Account stays free; each
  event is its own purchase. (Planner subscriptions = later product.)
- **Free ≠ $0 (the allowance):** TIER (free/pro features) and PRICE are separate
  axes. Each account gets **1 free-tier event at no cost** — the concurrent
  allowance (`free_event_available`): one *active* free event at a time; deleting
  or upgrading it frees the slot. Every additional event is **paid even at the
  Free tier** (~$50); Pro is always paid. The **first** free-tier event is always
  the $0 freebie (you can't pay for free-tier before using the allowance), and
  it's independent of paid events (a paid 1st event leaves the allowance intact).
  Enforced via `events.activated_at` (NULL = pending payment, locked) +
  `assert_event_active`; a 2nd+ unpaid event is activated by its Stripe webhook.
- **Tiers:** **Free + Pro only.** Advanced deferred until there are features to
  justify it — the `plans` catalog makes adding a tier a data change, not a
  migration.
- **Plan versioning:** a `plans` row is an **immutable version**. Change terms
  by inserting a new version (`pro_v2`) + flipping `is_current` — never by
  editing a sold row. Events **pin** to their version (`events.plan_key`), so
  grandfathering is automatic.
- **Trial: removed (logic only).** The 7-day Pro trial logic is gone —
  `effective_plan_key` now just returns the pinned `plan_key`. The `profiles`
  table is **kept** as the generic per-account home (`trial_ends_at` dormant);
  re-add a branch in `effective_plan_key` + a `create_event` seed to bring it back.
- **Downgrade = whole-event edit lock.** When an event is over its effective
  plan's **countable** limits (e.g. a refund), **all `create_`/`update_`
  writes raise**; **`delete_` stays open** as the escape hatch. Dormant
  budget/gifts data is read-only but does **not** lock the event.
- **"Unlimited" = soft cap + rate limit + fair-use clause.** Pro guests market
  as unlimited; enforce a 2,000 ceiling + per-minute insert rate limit on the
  public RSVP path. Fair-use clause in ToS (see Legal).
- **Three separate enforcement layers** — priced plans vs health/fair-use
  ceilings vs rate limiting are kept apart (opposite lifecycles: plans are
  pinned/grandfathered, health/rate are global "latest wins"). Full rationale
  and boundaries in [`enforcement-layers.md`](enforcement-layers.md).
  **Current build = Layer 1 (payments) only; Layers 2 & 3 deferred** — safe
  because every plan now has a finite cap (no `legacy`/unlimited), so
  `assert_plan` already bounds the DB.
- **Grandfathering:** all existing events pinned to **`pro`** (verified
  2026-06-18 that none exceed Pro caps), so the lock can't fire on them and they
  keep `pro` even after a future `pro_v2`.
- **Payments:** **Stripe Checkout** with **card + PayNow** (PayNow essential in
  SG) → Supabase Edge Function webhook flips `events.plan_key`. Price in SGD.
  GST deferred (only mandatory above S$1M turnover).

### Seed numbers (v1 — tweak later via a new version row, never by editing)

| | Free | Pro |
|---|---|---|
| `max_days` | 1 | 10 |
| `max_segments_per_day` | 3 | 30 |
| `max_invitation_pages` | 1 | 30 |
| `max_guests` | 500 | 2000 *("Unlimited")* |
| `max_members` | 3 | 50 |
| `can_use_budget` | ✗ | ✓ |
| `can_use_gifts` | ✗ | ✓ |
| `can_remove_branding` | ✗ | ✓ |

Existing events are grandfathered to **`pro`** (no separate `legacy` plan —
verified no current event exceeds Pro caps).

---

## Phases

### Phase A — DB foundation (additive) ✅ written · ⏳ paste-run
Purely additive: new tables + new functions, nothing live touched. Safe to run
while the current frontend keeps working.

  *(All plan migrations live in the `…000101+` lane on 2026/06/18 — kept clear of
  the unrelated invitation/guest migrations already at `…000001`–`…000009`.)*
- [x] `20260618000101_plans_catalog.sql` — `plans` table (+ `stripe_price_id`/
      `price`) + seed free/pro v1.
- [x] `20260618000102_events_plan_key_and_trial.sql` — `events.plan_key` +
      `events.activated_at` + `profiles` (generic per-account table); grandfather
      → `pro`. *(trial logic removed; `profiles` kept, dormant)*
- [x] `20260618000103_event_purchases.sql` — Stripe ledger: verification record
      (price_id/amount/customer), `event_purchase_status` lifecycle enum
      (pending→paid→refunded/disputed), idempotent webhook.
- [x] `20260618000104_plan_guard_functions.sql` — `effective_plan_key`,
      `plan_allows`/`assert_plan` (guests = **two-cap**: active ≤ `max_guests`,
      total incl cancelled ≤ `max_guests × (1+cancelled_grace_pct)`),
      `is_event_over_plan`/`assert_within_plan`, `free_event_available`,
      `assert_event_activated`, `assert_event_writable`.
- [ ] **Paste-run 101→104 in order** in the Supabase SQL editor.
- [ ] **Verify:**
      ```sql
      select key, tier, is_current, max_guests, can_use_budget from plans order by tier, version;
      select plan_key, count(*) from events group by plan_key;  -- expect all 'pro'
      ```

### Phase B — wire guards into write RPCs ⏳
In-place edits are safe **because every existing event is within Pro caps**
(grandfathered to `pro`, verified), so guards are inert for current data and
only bite new free events.

- [x] `create_event` (migration 105) — set `activated_at` from `free_event_available(auth.uid())`:
      `now()` when the allowance is free (the $0 freebie), else `NULL` (pending —
      a 2nd+ event must be paid; structurally forces the first free event to be free).
- [x] `create_day` → `assert_event_writable` + `assert_plan(event,'days',1)`. *(migration 106)*
- [x] `create_segment` → `assert_event_writable` + `assert_plan(event,'segments',1,day_id)`. *(migration 106)*
- [x] `create_invitation` → `assert_event_writable` + `assert_plan(event,'pages',1)`. *(migration 106)*
- [x] `create_member` → `assert_event_writable` + `assert_plan(event,'members',1)`. *(migration 106)*
- [x] **Migration 109 — RSVP/guest gates** (expand step; cutover later). Built
      against the per-page model in `000009`:
  - `create_guest` — renamed + gated successor to `create_guest_on_pages`
    (`create_guests` 2-arg is dead): `assert_event_writable` + per-row
    `assert_plan('guests')`. *(no `_v2` — final name now; drop `_on_pages` later)*
  - `submit_rsvp_v2` → the two-cap `plan_allows('guests',n)` on the **public**
    path (on top of the per-page seating check), reusing the guest-friendly
    "reached maximum capacity" message. *(rate limit deferred)*
  - `update_invitation_v2` → **clamp `max_guests` ≤ plan cap and default unset →
    cap** (so the existing per-page check always carries the plan limit) +
    `assert_event_writable`.
  - `update_guest_v2` → `assert_event_writable` + a guest check that fires only
    when the edit **grows** active count (bigger party / un-cancel).
- [x] Budget writes → gated at the `get_or_create_budget_bucket` chokepoint
      (covers `create_expense`/`update_expense`/`update_budget`):
      `assert_event_writable` + `assert_plan(event,'budget')`. *(migration 107)*
- [x] Gifts → `create_gift`/`update_gift`: `assert_event_writable` +
      `assert_plan(event,'gifts')`. `delete_*` ungated. *(migration 107)*
- [x] `update_day`/`update_segment` → `assert_event_writable` (lock only). *(migration 108)*
- [ ] Remaining `update_*` (tasks/timeline/…) lock sweep — downgrade-completeness
      follow-up, after the core payment slice.
- [ ] **Abandoned-pending cron** — sweep `events WHERE activated_at IS NULL AND
      created_at < now() - interval '7 days'` (kills slug-squatting + clutter),
      mirroring the `slug_reservations` cleanup cron.
- [ ] **Verify:** a Pro event allows multi-day/budget/gifts; a Free event blocks
      them. Force over-limit (e.g. set `plan_key='free'` on a multi-day event) →
      create/update blocked, delete allowed, unblocks after trimming. A 2nd event
      is born pending (`activated_at IS NULL`) and locked until activated.

### Phase C — entitlements to the client ⏳
- [ ] Extend `get_bootstrap_context` to return `effective_plan_key`, the plan
      row (limits + flags), current counts, `is_event_over_plan`, and the
      event's `activated_at` (pending-payment state).
- [ ] `usePlan()` / `useEntitlements()` hook beside `useAccess()` — **UX only**,
      never the boundary. Components read the hook, never the store.
- [ ] `plan-config` map (mirror `access-config.ts`) for labels / "Unlimited".
- [ ] UI: usage meters ("480 / 500 guests"), gated-module read-only state,
      over-limit banner naming the offending resource(s).
- [ ] **No surprise checkout (paid-event disclosure).** `create_event` is
      unchanged (returns `is_pending`); the UI makes the price honest *up front*,
      never sprung after the work:
  - When the free allowance is used, the **"New event" entry shows the price**
    (e.g. "New event · $50") + names the free event it's already on.
  - Price stays visible **through the wizard**; user **acknowledges** before building.
  - A pending (2nd+) event **saves as a draft** — "pay later", nothing lost;
    checkout is framed as *"Activate [Event]"* (completion), not a tollgate.
  - The abandoned-pending cron needs a **generous grace window + a heads-up**
    before sweeping, so a real draft is never yanked away.
- [ ] **Verify:** `npm run build`; UI reflects plan + pending-payment state correctly.

### Phase D — downgrade behaviour & upgrade nudges ⏳
- [ ] `get_public_invitation`: for a free event, serve only the **root** page;
      **non-root pages unpublish** (gate to guests). Branding returns when
      `can_remove_branding` is false.
- [ ] Upgrade CTA on every blocked action + in delete-confirm modals (honest
      stakes: "keep everything → Upgrade" vs "delete → lose your work"). **No
      dark patterns** — keep existing confirm modals, add truthful cost + CTA.
- [ ] **Verify:** downgraded event's non-root invite pages are dark to guests;
      root stays live; branding reappears.

### Phase E — Stripe (Checkout → webhook → plan) ⏳
- [ ] Stripe account (Individual / Sole-Prop OK to start) with **PayNow + cards**
      enabled; SGD.
- [ ] Checkout Session creation (server) with `metadata.event_id` + target
      `plan_key`. Hosted Checkout / Payment Link (no custom card form).
- [ ] Edge function webhook (service role; pattern: `supabase/functions/send-timeline-push`):
      `checkout.session.completed` → insert `event_purchases` (idempotent on
      session id) → `update events set plan_key = <current pro> where id = metadata.event_id`.
- [ ] Refund/dispute (`charge.refunded`) → append `status='refunded'`. Downgrade
      policy: **leave Pro, handle manually** at this scale (lock mechanism makes
      auto-downgrade trivial later).
- [ ] Return flow: refetch event (or realtime on `events`) so it unlocks live.
- [ ] **Verify:** test-mode purchase flips plan; replayed webhook is a no-op.

### Phase F — sync & ship ⏳
- [ ] Update `supabase/schema.sql` (reference dump) with the new tables,
      columns, and functions — one pass, after Phase B lands.
- [ ] Legal: **fair-use clause** + **refund policy** pages live (Stripe activation
      needs them; digital-goods refunds are dispute-sensitive).
- [ ] Full `npm run build`; manual QA of the gate matrix.
- [ ] PR `feat/subscription-plans` → `main`.

---

## Legal (SG) — "unlimited" & refunds
- Market "Unlimited guests"; enforce 2,000 ceiling + rate limit server-side.
- **Fair-use clause** in ToS makes "unlimited" honest (CPFTA / ASAS: must not
  mislead; a 2,000 cap no real wedding reaches → no consumer is impaired).
- Refund-dispute evidence packet: ToS acceptance, access/delivery logs,
  `event_purchases` record.

## Codebase grounding
- Schema & RPCs: `supabase/schema.sql`; `create_event`, `submit_rsvp`,
  `create_guests`, `create_member`, `create_day`, `create_segment`,
  `create_invitation`, budget/gift RPCs.
- Migration conventions: `supabase/migrations/README.md` (idempotent, rollback
  footer, **never mutate a live public RPC's signature — `_v2` if needed**).
- Bootstrap payload (entitlements ride here): `src/pages/admin/bootstrap/`.
- Access pattern to mirror: `src/pages/admin/hooks/useAccess.ts`;
  config-as-data: `src/pages/admin/access/components/access-config.ts`.
- Edge-function pattern for the webhook: `supabase/functions/send-timeline-push`.

## Guardrails (from CLAUDE.md)
- `schema.sql` + `migrations/` are source of truth; every backend change = a
  timestamped migration. Never call an unconfirmed RPC.
- `useAccess()` / `usePlan()` are client UX gates; **RLS + RPCs are the real
  boundary.** Client gating never substitutes for server enforcement.
- Reuse feature-folder structure + primitives. `npm run build` before done. No
  `console.log` / TODO / commented code in commits.
