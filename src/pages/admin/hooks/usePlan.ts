import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import {
  PLAN_METERS,
  tierIndex,
  nextTier as findNextTier,
  type PlanResource,
  type PlanFeature,
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

  /** Usage meter for a countable resource. No "unlimited" — every cap is real
   *  (fair use). */
  const meter = (resource: PlanResource) => {
    const used = plan.usage[resource];
    const max = limitFor[resource];
    return { used, max, atLimit: used >= max, remaining: Math.max(0, max - used) };
  };

  /** Resources at/over their cap — drives the limit-reached banner + per-feature UX. */
  const reachedLimits: PlanResource[] = PLAN_METERS.map((m) => m.resource).filter(
    (r) => meter(r).atLimit,
  );
  /** Any countable is at/over its cap. */
  const isReachedPlanLimits = reachedLimits.length > 0;

  return {
    planName: plan.name,
    planTier: plan.tier,
    isPaid,
    canUpgrade,
    /** Next tier up the ladder (catalog row with name/price), or null at the top. */
    nextTier: next,
    isPending,
    isOverPlanLimits,
    isReachedPlanLimits,
    canUseFeature,
    meter,
    reachedLimits,
  };
}
