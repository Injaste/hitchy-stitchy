# Payments & Plans — Locked Decisions (record)

> **Superseded for execution by [`execution-plan-E.md`](execution-plan-E.md).**
> The DB foundation, guards, write-RPC gating, and entitlements described by the
> old Phase A–D checklists are **built and merged** — remaining work (Stripe rail,
> bespoke service, cleanup) lives in `execution-plan-E.md`. This file is kept as the
> durable record of the **commercial decisions** and **legal stance** behind the build.

**Scope:** Single-event, one-time-payment product line (Free + Pro). The
planner/agency subscription line is out of scope (a later product; this architecture
leaves room for it but builds nothing for it).

---

## Locked decisions

- **Billing unit:** one-time payment, **per event**. Account stays free; each event is
  its own purchase. (Planner subscriptions = later product.)
- **Free ≠ $0 (the allowance):** TIER (free/pro features) and PRICE are separate axes.
  Each account gets **1 free-tier event at no cost** — the concurrent allowance
  (`free_event_available`): one *active* free event at a time; deleting or upgrading it
  frees the slot. Every additional event is **paid even at the Free tier** (S$50); Pro
  is always paid. The **first** free-tier event is always the $0 freebie, independent of
  paid events. Enforced via `events.activated_at` (NULL = pending payment, locked) +
  `assert_event_writable`; a 2nd+ unpaid event is activated by its Stripe webhook.
- **Tiers:** **Free + Pro only.** Advanced deferred until there are features to justify
  it — the `plans` catalog makes adding a tier a data change, not a migration.
- **Plan versioning:** a `plans` row is an **immutable version**. Change terms by
  inserting a new version (`pro_v2`) + flipping `is_current` — never by editing a sold
  row. Events **pin** to their version (`events.plan_key`), so grandfathering is automatic.
- **Trial: removed (logic only).** `effective_plan_key` returns the pinned `plan_key`.
  `profiles` is kept as the generic per-account home (`trial_ends_at` dormant); re-add a
  branch in `effective_plan_key` + a `create_event` seed to bring it back.
- **Downgrade = whole-event edit lock.** When an event is over its effective plan's
  **countable** limits (e.g. a refund), **all `create_`/`update_` writes raise**;
  **`delete_` stays open** as the escape hatch. Dormant budget/gifts data is read-only
  but does **not** lock the event.
- **"Unlimited" = soft cap + rate limit + fair-use clause.** Pro guests market as
  unlimited; enforce a 2,000 ceiling + per-minute insert rate limit on the public RSVP
  path. Fair-use clause in ToS (see Legal).
- **Three separate enforcement layers** — priced plans vs health/fair-use ceilings vs
  rate limiting are kept apart (opposite lifecycles). Full rationale in
  [`enforcement-layers.md`](enforcement-layers.md). Current build = Layer 1 (payments)
  only; Layers 2 & 3 deferred — safe because every plan has a finite cap.
- **Grandfathering:** all existing events pinned to **`pro`** (verified 2026-06-18 none
  exceed Pro caps), so the lock can't fire on them, and they keep `pro` even after a
  future `pro_v2`.
- **Payments:** **Stripe Checkout** with **card + PayNow** (PayNow essential in SG) →
  Supabase Edge Function webhook flips `events.plan_key`. Price in SGD. GST deferred
  (only mandatory above S$1M turnover).

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

Existing events are grandfathered to **`pro`** (no separate `legacy` plan — verified no
current event exceeds Pro caps).

---

## Legal (SG) — "unlimited" & refunds

- Market "Unlimited guests"; enforce 2,000 ceiling + rate limit server-side.
- **Fair-use clause** in ToS makes "unlimited" honest (CPFTA / ASAS: must not
  mislead; a 2,000 cap no real wedding reaches → no consumer is impaired).
- Refund-dispute evidence packet: ToS acceptance, access/delivery logs,
  `event_purchases` record.
- **No self-serve refunds.** Policy = "all sales final — evaluate on Free first";
  the Free tier is the trial. Refunds are a manual goodwill action in the Stripe
  dashboard; there is **no in-app refund/request UI**. Primary fraud defence is
  payment-up-front (activation gates value before delivery) + Stripe Radar +
  winning disputes with the evidence packet above.

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
