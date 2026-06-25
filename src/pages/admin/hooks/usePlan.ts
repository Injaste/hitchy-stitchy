import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import {
  PLAN_METERS,
  UNLIMITED_ON_PAID,
  nextTier,
  tierRank,
  type PlanResource,
  type PlanFeature,
} from "../plan/plan-config";

/** Client plan gate — UX only (the server's RLS + RPCs are the real boundary).
 *  Mirrors useAccess: read the store, expose reactive entitlement helpers. */
export function usePlan() {
  const plan = useAdminStore((s) => s.plan);

  /** On a paid tier (drives the crown / status, not feature access — features
   *  are flag-driven below). */
  const isPaid = tierRank(plan.tier) > 0;
  /** The tier checkout would sell next, or null at the top tier. */
  const next = nextTier(plan.tier);
  /** There's a higher tier to upsell (false on the top tier). */
  const canUpgrade = next !== null;
  // Two SEPARATE concerns — never merge them:
  /** activation/billing: activated_at NULL = a 2nd+ event awaiting payment. */
  const isPending = plan.activatedAt === null;
  /** limits: over the effective countable caps (downgrade, e.g. a refund). */
  const isOverPlanLimits = plan.isOverPlanLimits;

  // Feature modules.
  const { canUseBudget, canUseGifts, canRemoveBranding } = plan.limits;

  /** Feature-module access, keyed so the mapping stays exhaustive (a new
   *  PlanFeature is a compile error until it's added here). Drives RequirePlan. */
  const featureEnabled: Record<PlanFeature, boolean> = {
    budget: canUseBudget,
    gifts: canUseGifts,
  };
  const hasFeature = (feature: PlanFeature) => featureEnabled[feature];

  /** Per-resource cap. Keyed so the mapping stays exhaustive — a new
   *  PlanResource is a compile error until it's added here, with no silent
   *  fallthrough to the wrong limit. */
  const limitFor: Record<PlanResource, number> = {
    guests: plan.limits.maxGuests,
    days: plan.limits.maxDays,
    pages: plan.limits.maxInvitationPages,
    members: plan.limits.maxMembers,
  };

  /** Usage meter for a countable resource. `unlimited` hides the number for the
   *  Pro tiers we market as unlimited (the cap is a soft ceiling). */
  const meter = (resource: PlanResource) => {
    const used = plan.usage[resource];
    const max = limitFor[resource];
    return {
      used,
      max,
      unlimited: isPaid && UNLIMITED_ON_PAID.has(resource),
      atLimit: used >= max,
      remaining: Math.max(0, max - used),
    };
  };

  /** Resources at/over their cap — excludes "unlimited" ones (a Pro guest cap
   *  isn't a "reached limit"). Drives the limit-reached banner + per-feature UX. */
  const reachedLimits: PlanResource[] = PLAN_METERS.map((m) => m.resource).filter(
    (r) => {
      const m = meter(r);
      return m.atLimit && !m.unlimited;
    },
  );
  /** Any countable is at/over its cap. Derived here (not by line 14) because it
   *  depends on the meter; isOver/isPending above are plain plan.* reads. */
  const isReachedPlanLimits = reachedLimits.length > 0;

  return {
    planName: plan.name,
    planTier: plan.tier,
    isPaid,
    canUpgrade,
    nextTier: next,
    isPending,
    isOverPlanLimits,
    isReachedPlanLimits,
    canUseBudget,
    canUseGifts,
    canRemoveBranding,
    hasFeature,
    meter,
    reachedLimits,
  };
}
