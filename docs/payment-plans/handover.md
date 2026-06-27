# Plan Tiers — Handover

_Last updated: 2026-06-27. Branch: `feat/plan-tiers-starter`._

Per-event subscription/plan system. Four tiers — **Starter, Plus, Pro, Advanced** — fully **DB-driven** (no hardcoded tier lists or feature maps in the frontend; everything comes from the bootstrap). Sibling docs: [`execution-plan.md`](execution-plan.md), [`enforcement-layers.md`](enforcement-layers.md).

---

## 1. Architecture

**Identity & versioning** (locked in migration `20260627000101`):
- `key = solo_N_vM` — immutable pin target; the version lives in the key. `events.plan_key` FK → `plans.key`.
- `tier = solo_N` — groups versions of a tier.
- `rank` — ladder position (reorderable; decouples order from identity).
- `is_active` — the one live, sellable version per tier (`≤1 active per tier`, partial unique index).
- `is_free_tier` — marks the $0-first-event allowance tier (entry price is the $50 *subsequent*-event fee, so it can't be detected by price). `≤1 active free tier`.
- Grandfathering: events pin to a key, so superseding a tier = insert `solo_N_v2` + flip `is_active`; existing events keep their pinned version.
- Agency (future) is purely additive: a separate account-level subscription table that REFERENCES a solo tier. Nothing here changes for it.

**Read path:** the catalog flows through `get_bootstrap_context(p_slug)` (SECURITY DEFINER) → `data.catalog` (each entry enriched with `limits` + `features`). There is **no `plans_public` view** (dropped in `…000102`) — it was redundant and returned 0 rows under RLS. The `plans` table is RLS-locked/ungranted; only definer RPCs read it. **`cancelled_grace_pct` and `stripe_price_id` must never reach the client.**

## 2. Tiers (current seed)

| Tier | key | price | guests | days | seg/day | pages | members | gifts | expenses | features |
|---|---|---|---|---|---|---|---|---|---|---|
| Starter | `solo_1_v1` | 50 | 50 | 1 | 1 | 1 | 2 | 0 | 0 | invitation, guests (is_free_tier) |
| Plus | `solo_2_v1` | 140 | 500 | 1 | 1 | 1 | 2 | 0 | 0 | invitation, guests |
| Pro | `solo_3_v1` | 400 | 1000 | 5 | 5 | 5 | 10 | 200 | 200 | + timeline, tasks, members, access, budget, gifts |
| Advanced | `solo_4_v1` | 1000 | 5000 | 14 | 10 | 10 | 30 | 2000 | 2000 | everything incl. remove-branding |

Prices are stored but **hidden everywhere in the UI** (pricing isn't live yet).

## 3. Migrations (applied, manual)

- `supabase/migrations/2026/06/27/20260627000101_solo_plans_catalog.sql` — definitive `plans` rebuild (schema, constraints, partial unique indexes, RLS, FK repoint), Starter + Plus seed, `free_event_available`, `get_bootstrap_context`.
- `supabase/migrations/2026/06/27/20260627000102_plans_pro_advanced_and_catalog.sql` — Pro + Advanced seed, drop `plans_public`, re-paste `get_bootstrap_context` with the catalog enriched (per-tier `limits` + `features` for the upgrade diff).

> Migrations are applied manually (nested `YYYY/MM/DD/` folders, not the CLI). 100-block-per-feature convention: plans = `…01xx`, invitation/template seeds = `…00xx`. The `102` file was renumbered down from `103` (the original `102` was a superseded `plans_public_definer` ALTER that was deleted). Plan-gating of the existing RPCs lives in `…000104/106/107/109` (June 18 block).

## 4. Frontend

- **`usePlan`** (`src/pages/admin/hooks/usePlan.ts`) — the client plan gate (UX only). Exposes `canUseFeature`, `meter` (`used/max/near/atLimit`), `nearLimits`, `isNearPlanLimits`, `isAtUpgradableLimit`, `isOverPlanLimits`, `isPending`, `nextTier`, `canUpgrade`, `limits`. `near` uses `NEAR_LIMIT_RATIO = 0.8`.
- **`useAccess`** — permission gate. **`RequireRoute` = `RequireAccess` (permission → NoAccessState) + `RequirePlan` (feature → PlanLockedState)**, placed in `element=`.
- **`plan-config.ts`** — `PLAN_METERS`, `PLAN_FEATURES`, `PLAN_CAP_LABELS`, `CAP_KEY_FOR`, `NEAR_LIMIT_RATIO`, `PlanTierRow`, `tierIndex`/`nextTier`.
- **Components:**
  - `LimitReachedBanner` — only nudges when a metered limit is **≥80% AND a higher tier raises it** (so Starter's permanent 1-day/1-page baseline never nags). 3 states: approaching / reached / paused.
  - `UpgradeModal` — one unified comparison built from the bootstrapped catalog: metered usage folded in (`45/50 → 500`) with a lucide arrow, at-limit values in warning colour, then unlocked features. **Newly-unlocked limits (from 0) show just the value (`200`), no `0 →`.** No prices anywhere.
  - `PlanLockedState` — per-feature icon (mirrors the sidebar) + lock badge + one-line description + higher-plan pill.
  - `ActivationModal` — non-closable gate for a pending (unactivated) event.
- **`AdminRoutes`** — tier-aware landing redirect: first page the plan enables AND the member can access → Starter/Plus open on **guests**, Pro/Advanced on **timeline** (no per-tier hardcoding).

## 5. Server enforcement (the real boundary)

- `assert_plan(event, resource, n, scope)` — numeric caps (`days`, `segments` [named only], `pages`, `members`, `guests`) + feature flags (`budget`, `gifts`, `branding`).
- `assert_event_writable` / `assert_within_plan` — activation + over-limit (editing-paused) lock.
- Per-page guest capacity is bounded by the plan cap in `update_invitation_v2` (a page's `max_guests` can't exceed the plan's `max_guests`).
- Wired into create/update RPCs; **never** in delete RPCs (deletes are how an over-limit user trims back).

## 6. Verified working

- **Starter:** days/pages/segments/guest caps enforced; budget+gifts feature-gated server-side; all non-entitled modules blocked client-side; page `max_guests` ≤ 50 (51 rejected).
- **Plus:** 500-guest ceiling (page max ≤ 500, 501 rejected; **RSVP path blocks at the ceiling**), days cap 1, invitation cap 1, budget/gifts blocked, landing → guests.

## 7. ⚠️ OPEN BUGS (found in testing — NOT fixed)

### Bug 1 (HIGH) — `create_guest_on_pages` bypasses the guest cap
The admin "Add guest" RPC (`create_guest_on_pages`, last defined in `supabase/migrations/2026/06/18/20260618000009_drop_source_single_mode_enum.sql`) only checks **per-party** size against the page's `guest_count_max`. It has **no** cumulative `max_guests` check, **no** `assert_plan('guests', …)`, and **no** `assert_event_writable`. Proven: an admin added guest **#501 on a 500-cap Plus event** (the public RSVP path correctly blocked the identical add). It also works on pending/over-limit events.
**Root cause:** missed in the gating pass — `…000106/107/109` gated `submit_rsvp`, `create_guest`, `update_guest`, but not `create_guest_on_pages` (the function the admin UI actually calls).
**Fix:** new migration redefining `create_guest_on_pages` to add `assert_event_writable(p_event_id)`, a cumulative page-capacity check (`existing sum + v_count ≤ v_inv.max_guests`), and `assert_plan(p_event_id,'guests',v_count)` — mirroring `submit_rsvp`.

### Bug 2 (MEDIUM — needs a product decision) — feature flags not server-enforced for timeline/tasks/members/access
Only `budget`/`gifts`/`branding` are server-gated as features. On Plus: `create_task` succeeded, `create_member` succeeded up to the numeric cap, timeline days/segments allowed up to caps — all despite the features being "locked" in the UI. Client gating (`RequirePlan`) hides them, but per the project rule *"client gating is UX only; the server is the real boundary"* the server should enforce.
**Decision needed:** are timeline/tasks/members/access **hard** Pro features (add `assert_plan(feature)` + `plan_allows` cases to their create RPCs), or are the numeric caps (Starter's 1 day, 2 members, etc.) the intended allowance? The `can_use_*` flag, the caps, and the UI lock currently disagree.

## 8. Pending / next steps

- Fix Bug 1; resolve + (maybe) fix Bug 2.
- **Stripe** checkout + webhook (test-mode first) — drives `events.activated_at` + `event_purchases`. Secrets in Supabase Edge only (never repo/chat). Price ID is safe to share.
- Optional: sidebar lock-badge for locked modules (sidebar currently shows all items; clicking a locked one → `PlanLockedState`).

## 9. Testing approach & fixtures

Test events in the DB: **`/starter`** (Starter, active), **`/plus`** (Plus, active), **`/edge-case-test`** (Starter). Activation is done directly in the backend, e.g.:
```sql
UPDATE events SET plan_key = 'solo_2_v1', activated_at = now() WHERE slug = 'plus';
```
RPCs are exercised end-to-end via the app's authenticated Supabase client in the browser preview:
```js
const sb = (await import('/src/lib/supabase.ts')).supabase;
await sb.rpc('get_bootstrap_context', { p_slug: 'plus' });
```
Calls run as the logged-in super-admin, so RLS/RPC gating is tested for real. Always clean up created rows (a leftover over-cap guest flips `is_over_plan_limits` and pauses editing).

### Key RPC signatures
- `create_event(p_slug, p_name, p_days[], p_display_name, p_role)`
- `create_guest_on_pages(p_event_id, p_invitation_ids[], p_guest{name,phone,guest_count,message,status})`
- `submit_rsvp(p_invitation_id, p_fields{name,phone,guest_count,message}, p_invite_code)`
- `update_invitation_v2(p_event_id, p_id, p_template_key, p_draft_config, p_rsvp_mode, p_rsvp_deadline, p_max_guests, p_guest_count_min, p_guest_count_max, p_confirmation_message, p_rsvp_config, p_private_code, p_to_publish)`
- `create_invitation(p_event_id, p_template_key, p_day_id, p_segment_id, p_link_slug)` · `unpublish_invitation(p_event_id, p_id)` · `delete_invitation(p_event_id, p_id)` (published pages must be unpublished first) · `delete_guest(p_event_id, p_id)`
- `create_expense(... p_amount numeric, p_paid numeric ...)` · `create_gift(p_event_id, p_given_by, p_amount, p_method, p_notes)` · `create_task(p_event_id, p_title, …)` · `create_member(p_event_id, p_display_name, p_access_group_id, p_role, …)`
- `get_templates(p_event_id)` → rows with `template_key` (not `key`)

## 10. Commits (branch `feat/plan-tiers-starter`, on top of `main`)

- tier-agnostic plan model + unified route guard (Starter-only)
- DB-driven solo catalog + per-module gating (Starter/Plus)
- Pro/Advanced tiers + catalog-driven upgrade diff; hide pricing
- 80% upgrade nudge for raisable limits + redesigned upgrade comparison; fix catalog cap casing (`bootstrap/api.ts` snake→camel)
- tier-aware admin landing + feature-icon locked state + guests→invitation shortcut
- hide `0 →` for newly-unlocked limits in the upgrade modal

> Branch history was rebased onto `main` multiple times, so it diverges from `origin/feat/plan-tiers-starter` — pushes use `--force-with-lease`.
