# Plans — Packaging Spec

The single doc for **refining the tier design** — lineup, caps, prices,
differentiation. Stripe integration / the payment rail is tracked in a **separate
doc**; already-built enforcement (catalog, triggers, guards) is intentionally not
re-documented here. This is the plan, not the build record.

---

## Strategy (why)

- **Per-event, one-time payment.** A professional, **celebrations-broad** platform
  (not weddings-only). Planner/agency = a separate future line.
- **Guest caps are an intentional monetization lever.** The old "never gate on guest
  count" principle is reversed: modern SG celebrations rarely exceed these caps, and
  the free cap stays generous enough to demo the product.
- **Retuning is safe.** The catalog is DB-driven and versioned (`solo_N_vM`,
  immutable + pinned per event), so changing any cap or price is a new version + a
  data change — never a migration of sold rows. Grandfathering is automatic, so we
  refine freely pre-launch.

---

## Launch lineup — Starter / Plus / Pro (Advanced deferred)

| | **Starter** (free) | **Plus** ($140) | **Pro** ($400) |
|---|---|---|---|
| Guests | **100** | 500 | **2000** |
| Timeline items | 15 | 50 | 200 |
| Tasks | 25 | 75 | 300 |
| Members | 4 | 4 | 10 |
| Event days | 1 | 1 | 5 |
| Invitation pages | 1 | 1 | 5 |
| Premium templates | — | **✓** | ✓ |
| Timeline **live-run** | — | — | **✓** |
| Money suite (budget/gifts) | — | — | **✓** |
| Remove branding | — | — | — |

- **Advanced (solo_4) is deferred — not launched.** Branding removal + the highest
  caps live there; it returns when seating/vendors justify it.
- Everything is **try-before-buy**: every core module is usable on every tier, just
  capped. The paywalls are the *high-value moments* — running the day **live**, the
  **money suite**, and **premium templates** — not the planning itself.

## Allowance & activation

- **3 free events per account** (each a Starter event at $0). The **4th+ event
  requires a $50 activation.**
- Real couples have one event, so the $50 fee rarely fires for the core audience —
  treat it as light anti-abuse / power-user pricing, **not a revenue line.** Revenue
  is Pro upgrades.

## Value ladder & differentiation

- **Starter (free):** try everything, capped; 100 guests; basic templates.
- **Plus ($140) — the beautiful-invitation tier:** premium template access + more
  headroom. For couples who just want a stunning invite, not planning tools.
- **Pro ($400) — the planning-power tier:** the money suite + run-the-day-**live** +
  2000 guests + real headroom.
- **Levers:** Starter→Plus sells on **design** (templates). Plus→Pro sells on
  **capability** (money suite, live-run) + **scale** (2000 guests).

---

## To build / decide (implied by these decisions)

- **Template tiering** — NEW, not built. Needs a premium / `min_plan_rank` flag on
  templates + a `get_templates` filter by the event's plan rank. Keep the free tier
  stocked with good templates across Chinese / Malay / Indian / secular.
- **Cap updates** — Starter guests 50 → **100**; Pro guests 1000 → **2000** (new
  plan versions, per the versioning-safety note above).
- **Allowance** — raise the free-event count 1 → **3**; pin **concurrent vs
  lifetime** (current `free_event_available` is concurrent).
- **Defer Advanced** — `solo_4` is currently seeded `is_active = true`; set it
  inactive so it drops off the live ladder until launch.
- **Reveal pricing** — still hidden; decide the surface (upgrade modal / pricing page)
  before charging.
