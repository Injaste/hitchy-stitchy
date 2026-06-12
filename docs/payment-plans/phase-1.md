# Phase 1 Handoff — Payments & Plans

High-level strategy snapshot. Written so a fresh chat with no prior context can pick it up cold and go deep. Phase 2 (planner/multi-wedding line) is deliberately out of scope here.

> **Current decision (status):** _Billing deferred — but laying the foundation now._
> The product has too few features to justify a paywall, so Stripe/PayNow, the paywall UX, prices, and the final Free/Pro feature-line all wait until features + real usage exist.
> **However**, we are doing the `event_days` spine + plan-gating scaffold **now**, while there's no live data to risk. Rationale: the data-model change is the only expensive, hard-to-reverse part; doing it pre-launch turns a future *data migration* (dangerous — live weddings, collected RSVPs) into a present *code refactor* (controllable). It's a "now or pay 10× later" decision.
> **Do now:** `event_days` spine; `events.plan` column; `plan-config` map; `usePlan()` hook; entitlements in `get_bootstrap_context`. **Defer:** everything billing. Don't let "prepare robustness" balloon into building billing. See **Readiness & sequencing** below.

---

## Product context
- App is **per-event scoped**: a logged-in user creates events (weddings) from a dashboard; each event has its own members, access groups, timeline, tasks, invitation page, guests/RSVP.
- A user can already own multiple events. One event already supports a **multi-day timeline** (days derived from the event's date range).
- **SG-first.** Weddings here are **large** (Chinese banquets 300+, Malay open-house 1000+) and often **multi-ceremony** (akad + bersanding; tea ceremony + banquet). **Do not gate on guest count** — culturally wrong.

## Billing model (locked)
- **Couples (B2C) = one-time payment, per event.** A wedding happens once; subscriptions are the wrong fit. No recurring billing for couples.
- **Each event is independently Free or paid.** An account gets **1 free event**; any additional event must be paid.
- Planner/agency line (subscription, multi-wedding, cross-wedding dashboard, team seats, Enterprise) is a **later phase — out of scope here.**

## Phase 1 tiers — single-event product line
Three tiers in the lineup. **Build order: Free + Pro first, then Advanced.** The data-model spine is laid up front so Advanced is an unlock, not a migration.

| | **Free** | **Pro** | **Advanced** (built after Free/Pro) |
|---|---|---|---|
| Billing | Free forever | One-time, per event | One-time, per event (higher) |
| `event_days` | 1 | 1 | many (cap ~5) |
| RSVP links | 1 | 1 | **1 per day** |
| Guest lists | 1 | 1 | **1 per day** |
| Vendor day-gating | — | — | ✅ |
| Invitation page | ✅ + "made with Hitchy Stitchy" badge | ✅ badge removed, premium themes, custom domain | ✅ |
| Features/limits | limited | **full** | full |

### Lever rules (locked)
- **Free → Pro** sells on **features + limits**, not days — both are single-day.
- **Pro → Advanced** sells on **single-day vs multi-day** (binary). No 2-vs-3 day counter.
- **1 RSVP link = 1 day.** Never decouple links from days. (Multiple links on one day = a separate "audience segmentation" feature; not in scope.)
- **Pro = "whole wedding, one guest list, one invite link"** — the timeline may still span multiple calendar dates under its single `event_days` row. Advanced = each ceremony invited & managed separately.

## Architecture decisions (locked)
1. **`event_days` is the universal spine from day one.** Every event uses it. Free = 1 row, Pro = 1 row, Advanced = N rows. Build the spine early (no live-data migration later); **gate the per-day *features*** (multi-link RSVP, per-day guest lists, vendor day-gating) for Advanced.
2. **Day = a filter/dimension within one event, NOT a context switch.** Reuse the existing timeline day-filter pattern (pick a day → data filters in place). No "switch day → reload everything."
3. **Members are event-level (see all days). Vendors are day-scoped** via a day allowlist, **enforced server-side** (RLS/RPC), reusing `event_members` + a "Vendor" access group. (`event_vendors` was previously dropped — this is a rebuild.)
4. **Plan-gating mirrors the existing access pattern** exactly:
   - Server-authoritative checks (quotas + feature flags) in RLS/RPCs — the real boundary.
   - A client UX hook (`usePlan()` / `useEntitlements()`) beside `useAccess()` — UX only. Components go through the hook, never read plan off the store directly.
   - Entitlements delivered in the existing `get_bootstrap_context` payload (one round trip, alongside permissions).
5. **Entitlements as data**, not scattered `if`s — a single `plan-config` map (mirrors the existing `access-config.ts` pattern).
6. **Payments:** Stripe **Checkout** with **card + PayNow** (PayNow is essential in SG) → **Supabase Edge Function webhook** flips `events.plan`. Price in **SGD**, tax-inclusive (GST deferred — only required above S$1M turnover).

## Readiness & sequencing
**Verdict: not ready to monetize. Build features first.** A paywall is only worth building when there's something worth paying for.

- **Exists today:** timeline, tasks, invitation page, guests/RSVP, members & access.
- **Pending:** announcements, vendors, table & chairs planning, live logs, check-ins.

If billing shipped now, "Pro" could only be carved from existing features (remove badge / more members / themes) — too thin to charge for. The compelling upsells (table planner, vendors, check-ins) are still pending.

**Recommended order:**
1. **`event_days` spine** — foundational data-model refactor (1 row per event). Unblocks the day-aware features below (vendors, check-ins, table & chairs all need day-scoping; building them on the old derived-date model means building twice).
2. **Thin gating scaffold** — just the `plan-config` map + a `usePlan()` stub. So each new feature *declares its tier as it's built* — no retrofitting gating across many features later.
3. **Build the new features**, each registering itself in the config as Free/Pro/Advanced.
4. **Launch free** — get users, feed the invitation viral loop (every guest sees the invite page), learn what's actually valuable.
5. **Turn on monetization last** — Stripe + PayNow + webhook + paywall UX, and finalize the Free/Pro/Advanced line against the features that now exist and real usage — not guesses.

## MVP assessment (as of this handoff)
- **Planning side (timeline / tasks / guests / members & access): MVP-ready.** Functional and differentiated (notably the access/members model).
- **Invitation / RSVP side: not yet.** Two gaps:
  - **Themes — content gap, not engine gap.** The theme *system* is fully built: template engine (`src/pages/wedding/templates/`), admin theme editor + browse/your-themes galleries + create/publish/delete flows (`src/pages/admin/invitation/themes/`), and `event_templates` + `event_themes` tables. Only **one** template is authored (`unique-muslim`). Need several quality designs — a design/authoring effort, not engineering.
  - **RSVP links / flow** need fleshing out before they carry a paid feature.
- **The five pending features are post-MVP differentiators**, not MVP requirements. MVP = make the core loop (plan → invite → RSVP → manage guests → coordinate team) genuinely good.

## Open decisions for the deep-dive chat
1. **Exact Free vs Pro feature split** — which features locked, member cap, any timeline limit on Free. (Not yet decided.)
2. **Pro price point** — illustrative range floated: **S$50–150** one-time.
3. **Free timeline:** keep the multi-date timeline, or restrict it? (Leaning: keep; differentiate on features.)
4. **Naming** for the later planner line (Enterprise vs "Planner") so it doesn't collide with "Advanced."
5. Confirm the **Pro = one guest list / one link / multi-date timeline** experience as intended.
6. **MVP wedge** — is the headline the invitation/RSVP product, or the planning tool? Determines what "enough for MVP" means.

## Codebase grounding (key files)
- Schema & RPCs: `supabase/schema.sql`; `create_event` in `supabase/migrations/2026/06/05/20260605000001_collapse_access_three_level.sql`; `get_bootstrap_context`.
- Access pattern to mirror: `src/pages/admin/hooks/useAccess.ts`; config-as-data: `src/pages/admin/access/components/access-config.ts`.
- Bootstrap payload (entitlements ride here): `src/pages/admin/bootstrap/api.ts`.
- Day model to extend: `src/pages/admin/timeline/hooks/useTimelineDays.ts`; `event_timelines.day` (`schema.sql:282`).
- Event creation (quota enforcement point): `src/pages/dashboard/create-event/CreateEventForm.tsx`.
- Theme system: `src/pages/wedding/templates/` (engine), `src/pages/admin/invitation/themes/` (editor + galleries).
- Edge-function pattern for the Stripe webhook: `supabase/functions/send-timeline-push`.

## Guardrails (from CLAUDE.md)
- DB lives in Supabase; `schema.sql` + `migrations/` are source of truth. Every backend change = a timestamped migration. Never call an RPC not confirmed in schema/migrations.
- `useAccess()` is the sole client access gate; server (RLS + RPCs) is the real boundary. The plan gate follows the same model.
- Reuse existing feature-folder structure and primitives. Run `npm run build` before marking done. No `console.log` / TODO / commented code in commits.
