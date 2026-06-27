# Phase 1 — Payments & Plans Strategy (record)

> **Superseded for execution by [`execution-plan-E.md`](execution-plan-E.md)**;
> commercial decisions + legal in [`execution-plan.md`](execution-plan.md). The build
> sequencing, MVP-readiness assessment, and open decisions this doc once held are
> **done / resolved** and have been removed. Kept as the durable record of the **why** —
> the strategy and the cultural constraints behind the product line.

## Product context
- App is **per-event scoped**: a user creates events (weddings); each has its own
  members, access groups, timeline, tasks, invitation page, guests/RSVP. A user can own
  multiple events; one event supports a multi-day timeline.
- **SG-first.** Weddings here are **large** (Chinese banquets 300+, Malay open-house
  1000+) and often **multi-ceremony**. **Do not gate on guest count** — culturally wrong.

## Billing model (locked)
- **Couples (B2C) = one-time payment, per event.** A wedding happens once; subscriptions
  are the wrong fit. No recurring billing for couples.
- **Each event is independently Free or paid.** An account gets **1 free event**; any
  additional event must be paid.
- Planner/agency line (subscription, multi-wedding, team seats, Enterprise) is a **later
  phase — out of scope here.**

## Tiers — single-event product line
**Free + Pro at launch.** Advanced is deferred until the features that justify it
(seating, per-day guest lists, vendor day-gating) exist — the data spine is laid so it
becomes an unlock, not a migration.

| | **Free** | **Pro** | **Advanced** (deferred) |
|---|---|---|---|
| Billing | Free forever (1st event) | One-time, per event | One-time, per event (higher) |
| `event_days` | 1 | 1 | many (cap ~5) |
| RSVP links / guest lists | 1 | 1 | **1 per day** |
| Vendor day-gating | — | — | ✅ |
| Invitation page | ✅ + branding badge | ✅ badge removed, premium themes | ✅ |
| Features/limits | limited | **full** | full |

### Lever rules (locked)
- **Free → Pro** sells on **features + limits**, not days — both are single-day.
- **Pro → Advanced** sells on **single-day vs multi-day** (binary). No 2-vs-3 day counter.
- **1 RSVP link = 1 day.** Never decouple links from days.
- **Pro = "whole wedding, one guest list, one invite link"** — the timeline may still
  span multiple calendar dates under one `event_days` row. Advanced = each ceremony
  invited & managed separately.

## Architecture principles (locked)
- **`event_days` is the universal spine from day one.** Every event uses it (Free/Pro = 1
  row, Advanced = N). Gate the per-day *features* for Advanced, not the spine.
- **Day = a filter/dimension within one event, not a context switch.** Reuse the timeline
  day-filter pattern; no "switch day → reload everything."
- **Members are event-level; vendors are day-scoped** via a day allowlist, enforced
  server-side.
- **Plan-gating mirrors the access pattern:** server-authoritative checks (RLS/RPCs) are
  the boundary; a client UX hook (`usePlan()`) beside `useAccess()` is UX only;
  entitlements ride in `get_bootstrap_context`.
- **Entitlements as data** — a single plan config map, not scattered `if`s.
- **Payments:** Stripe Checkout (card + PayNow) → Supabase Edge Function webhook flips
  `events.plan_key`. SGD, tax-inclusive (GST deferred).
