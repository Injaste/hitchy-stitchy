# Enforcement Layers — plans, health, rate limiting

Three **independent** guards sit on the write path. They are deliberately
separated: they protect different things, change for different reasons, and —
critically — have **opposite lifecycles**. Don't collapse them.

> Companion to [`execution-plan.md`](execution-plan.md) (the phased build) and
> [`phase-1.md`](phase-1.md) (strategy). This doc is the *why* and the boundaries.

> **Scope (2026-06-18):** **Layer 1 (priced plans / payments) is the current
> build. Layers 2 & 3 are deferred.** Safe because dropping `legacy` left every
> plan with a finite cap (Free 500 / Pro 2000), so `assert_plan` already bounds
> the DB — there is no "unlimited" plan to run away. Build triggers are in each
> deferred layer's section.

---

## Why three, not one — the grandfathering argument

This is the decisive reason, and it falls straight out of the plan-versioning
design:

- **`plans` rows are immutable and pinned.** An event keeps its plan version
  forever (`events.plan_key`) so its **entitlements are grandfathered**. Correct
  for *priced* limits — you sold someone "Pro v1 = 2000 guests", they keep it.
- **Health ceilings and rate limits must do the OPPOSITE.** They must apply to
  *everyone* — including grandfathered / old-version events — and be tightenable
  **globally and instantly** (e.g. you're under attack and need to drop the
  insert rate *now*, for all events).

If health/rate limits lived on `plans`, they'd get **pinned and grandfathered
too** — so your oldest events would be the ones that *escape* your newest safety
limits. Backwards. Priced limits want "pin and grandfather"; health/rate limits
want "latest always wins, no exceptions." Opposite lifecycles → **separate
homes, separate gates.**

---

## The three layers

| Layer | Protects | Concern | Storage | Gate | Lifecycle | Changes for |
|---|---|---|---|---|---|---|
| **1. Priced plans** | Revenue | entitlement + price | `plans` table (versioned, **pinned**) | `assert_plan` / `assert_event_writable` | grandfathered per event | business / marketing |
| **2. Health / fair-use** | Uptime | absolute ceilings, plan-independent | constants (or `system_limits` table later) — **never on `plans`** | `assert_health_limits` | latest wins, all events | infra scaling (rare) |
| **3. Rate limiting** | Uptime | velocity throttle | stateful: in-DB window-count → edge/token-bucket | `assert_rate_limit` | latest wins, instant | security / load |

They don't even share a key: plans are **per-event-version**, health is
**global**, rate is **per-actor-per-time-window**.

---

## Layer 1 — Priced plans (entitlement tied to payment)

The commercial layer: what each tier costs and grants. **Server-authoritative**
so it can't be spoofed.

- **Catalog:** `plans` table — versioned, pinned, grandfathered (see
  [`execution-plan.md`](execution-plan.md)).
- **Price is a Stripe SKU, not a client amount:** `plans.stripe_price_id`.
  Checkout references the price_id; the webhook **verifies the session's
  line-item price_id matches the plan** before granting. Closes the "pay $1 →
  Pro" hole.
- **Entitlement only on a verified, paid purchase:** `effective_plan_key` /
  `assert_event_active` trust a `event_purchases` row only when
  `status = 'paid'` and the price verified. `pending / failed / disputed /
  refunded` never grant access.
- **Gates:** `assert_plan(event, resource, n, scope)` (per-resource entitlement)
  and `assert_event_writable` (active + not over plan).

## Layer 2 — Health / fair-use ceilings (system safety net) · ⏸ Deferred

> **Deferred (2026-06-18).** With `legacy` gone, every plan has a finite cap, so
> `assert_plan` already bounds the DB — there's no unlimited plan to overrun.
> **Build trigger:** a plan goes live with very high / uncapped limits, or a
> misconfiguration risk appears.

The infrastructure layer: absolute limits that protect the DB **regardless of
plan**. This is the technical teeth of the "unlimited" / fair-use promise.

- **Plan-independent and global.** Applies to Free, Pro, grandfathered, future
  high-cap, or misconfigured plans alike. A plan saying "unlimited" still hits
  this wall.
- **Not on `plans`** (grandfathering would defeat it). Constants in
  `assert_health_limits` to start; promote to a single `system_limits` config
  row only if runtime tuning/monitoring is wanted.
- **Set far above any real use** — never marketed, never hit by a legitimate
  wedding. Illustrative: guests ≤ 5000, members ≤ 200, days ≤ 60. These are
  *safety stops*, not product limits.
- **Gate:** `assert_health_limits(event, resource, adding)` — on every write,
  *alongside* `assert_plan`.

## Layer 3 — Rate limiting (velocity, not totals) · ⏸ Deferred

> **Deferred (2026-06-18).** Defer unless this launch opens **live public RSVP
> collection** — the one anonymous abuse surface. If it does, add just the in-DB
> per-event limit (≤ 30 submissions/min/event). **Build trigger (edge/per-IP):**
> first sign of public-RSVP abuse, or RSVP volume making per-request checks costly.

The throughput layer: caps the **rate** of operations, which count-based plan
limits don't cover (someone scripting 2000 inserts in 2s is within their cap but
hammering the DB).

- **Per-actor, per-window, stateful.** e.g. N RSVP inserts / minute / event;
  M event-creations / hour / account.
- **MVP:** in-DB window count (`count(*) where created_at > now() - interval
  '1 minute'`) — no new table, fine at low volume.
- **Scale path:** move to the **edge** (Supabase edge function / token bucket in
  Upstash Redis) so floods are rejected *before* touching Postgres. Rate
  limiting in the DB is a stopgap, not the destination.
- **Gate:** `assert_rate_limit(actor, action)`.

---

## Write-path composition

Each gate is independent; none imports another. A create RPC runs all that apply:

```
assert_event_writable(event)         -- L1: active (paid) + not over plan
assert_plan(event, resource, n)      -- L1: per-resource entitlement
assert_health_limits(event, resource, n)  -- L2: absolute ceiling, all events
assert_rate_limit(actor, action)     -- L3: velocity throttle
-- … then the insert
```

`delete_*` RPCs run **none** of these (deletes are the escape hatch). Public
`submit_rsvp` runs L2 + L3 (+ the guest entitlement check), not the editable
lock.

---

## Fair use: legal vs technical — also two things

- **The legal clause** (ToS / fair-use policy text) — a published document. It
  *authorizes* throttling/suspension and keeps "unlimited" marketing honest
  (CPFTA / ASAS). Lives on a Terms page, not in code.
- **The technical teeth** — Layers 2 + 3. They *enforce* it.

Keep them distinct: the clause without the gates is unenforceable; the gates
without the clause are legally exposed.

---

## Scope decisions (resolved 2026-06-18)

1. **Health limits → constants** in `assert_health_limits` (not a table).
   Promote to a `system_limits` row only if runtime tuning/monitoring is ever
   needed. **Deferred** (Layer 2).
2. **Rate limits → in-DB window-count**, public `submit_rsvp` only, when built;
   edge/token-bucket is the scale path. **Deferred** (Layer 3).
3. **Per-actor key → per-event** for public RSVP (in-DB); **per-IP at the edge**
   later; **no per-account** creation limits — the free-event allowance +
   abandoned-pending cron + plan gates already cover creation spam.

## Codebase grounding

- Plans / pinning / grandfathering: [`execution-plan.md`](execution-plan.md);
  `plans`, `events.plan_key`.
- Existing gates to mirror: `has_event_permission`, `assert_*` family
  (`supabase/schema.sql`).
- Migration conventions: `supabase/migrations/README.md`.
- Edge-function pattern (rate-limit scale path + Stripe webhook):
  `supabase/functions/send-timeline-push`.
