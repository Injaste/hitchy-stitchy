import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import {
  PLAN_METERS,
  NEAR_LIMIT_RATIO,
  CAP_KEY_FOR,
  tierIndex,
  nextTier as findNextTier,
  type PlanResource,
  type PlanFeature,
  type PlanTierRow,
} from "../plan/plan-config";

/** Client plan gate — UX only (the server's RLS + RPCs are the real boundary).
 *  Everything is DB-driven: entitlements come from the bootstrapped plan, the
 *  upgrade ladder from the bootstrapped catalog. Nothing about tiers/features is
 *  hardcoded here. Mirrors useAccess: read the store, expose reactive helpers. */
export function usePlan() {
  const plan = useAdminStore((s) => s.plan);
  const catalog = useAdminStore((s) => s.catalog);

  // Ladder position comes from the DB catalog (ordered by rank), not a constant.
  const rank = tierIndex(plan.tier, catalog);
  /** On a paid tier (rank 0 = the free/entry tier). Drives the crown, not access. */
  const isPaid = rank > 0;
  /** The tier checkout would sell next (a catalog row), or null at the top. */
  const next = findNextTier(plan.tier, catalog);
  /** There's a higher tier to upsell. */
  const canUpgrade = next !== null;
  /** Every tier above the current one (rank-ordered) — the upgrade-picker choice
   *  set. `next` is the first entry; empty at the top tier / if not live. */
  const upgradeTiers = rank < 0 ? [] : catalog.slice(rank + 1);

  /** Whether the current event's usage fits within a target tier's caps — used to
   *  disable tiers a user would STILL be over (the downgrade-lock case). Only the
   *  metered resources are checkable client-side; segment/gift/expense caps aren't
   *  surfaced here, so a tier can read "fits" yet be rejected server-side on those. */
  const tierFits = (tier: PlanTierRow) =>
    PLAN_METERS.every(
      (m) => plan.usage[m.resource] <= tier.limits[CAP_KEY_FOR[m.resource]],
    );

  // Two SEPARATE concerns — never merge them:
  /** activation/billing: activated_at NULL = a 2nd+ event awaiting payment. */
  const isPending = plan.activatedAt === null;
  /** limits: over the effective countable caps (downgrade, e.g. a refund). */
  const isOverPlanLimits = plan.isOverPlanLimits;

  /** Whether the plan includes a feature/module — straight from the DB features
   *  map (no hand-written mapping). Drives RequirePlan. */
  const canUseFeature = (feature: PlanFeature) => plan.features[feature] ?? false;

  /** Per-resource cap. Keyed so the mapping stays exhaustive — a new
   *  PlanResource is a compile error until it's added here. */
  const limitFor: Record<PlanResource, number> = {
    guests: plan.limits.maxGuests,
    days: plan.limits.maxDays,
    pages: plan.limits.maxInvitationPages,
    members: plan.limits.maxMembers,
  };

  /** A limit is worth nudging only if the NEXT tier actually raises it — otherwise
   *  upgrading wouldn't help (e.g. Starter & Plus both allow a single day/page, so
   *  those never nag; only guests, 50→500, does). False at the top tier. */
  const raisesLimit = (r: PlanResource) =>
    next !== null && next.limits[CAP_KEY_FOR[r]] > limitFor[r];

  /** Usage meter for a countable resource. `near` = within the soft warning
   *  threshold of the cap; `atLimit` = at/over it. No "unlimited" (fair use). */
  const meter = (resource: PlanResource) => {
    const used = plan.usage[resource];
    const max = limitFor[resource];
    return {
      used,
      max,
      atLimit: used >= max,
      near: max > 0 && used >= max * NEAR_LIMIT_RATIO,
      remaining: Math.max(0, max - used),
    };
  };

  /** Limits nearing/at their cap THAT A HIGHER TIER RAISES — the upgrade-nudge set.
   *  Empty at the top tier (and for caps an upgrade can't lift), so the banner
   *  never nags with nothing to sell. */
  const nearLimits: PlanResource[] = PLAN_METERS.map((m) => m.resource).filter(
    (r) => raisesLimit(r) && meter(r).near,
  );
  /** Show the upsell nudge — a reached/approaching limit an upgrade would relieve. */
  const isNearPlanLimits = nearLimits.length > 0;
  /** Those actually AT the cap (not just approaching) — drives the modal's
   *  "capped now" list and the "reached" vs "approaching" copy. Non-raisable caps
   *  (e.g. Starter's 1-day) are excluded — no point flagging what no tier lifts. */
  const raisableReachedLimits = nearLimits.filter((r) => meter(r).atLimit);
  const isAtUpgradableLimit = raisableReachedLimits.length > 0;

  return {
    planName: plan.name,
    planTier: plan.tier,
    isPaid,
    canUpgrade,
    /** Next tier up the ladder (catalog row with name/price), or null at the top. */
    nextTier: next,
    /** All tiers above the current one — the upgrade-picker choice set. */
    upgradeTiers,
    tierFits,
    isPending,
    isOverPlanLimits,
    isNearPlanLimits,
    isAtUpgradableLimit,
    canUseFeature,
    /** Current countable caps (keyed) — for the upgrade diff. */
    limits: plan.limits,
    meter,
  };
}
