import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { PLAN_METERS, UNLIMITED_ON_PRO, type PlanResource } from "../plan/plan-config";

/** Client plan gate — UX only (the server's RLS + RPCs are the real boundary).
 *  Mirrors useAccess: read the store, expose reactive entitlement helpers. */
export function usePlan() {
  const plan = useAdminStore((s) => s.plan);

  const isPro = plan.tier === "pro";
  // Two SEPARATE concerns — never merge them:
  /** activation/billing: activated_at NULL = a 2nd+ event awaiting payment. */
  const isPending = plan.activatedAt === null;
  /** limits: over the effective countable caps (downgrade, e.g. a refund). */
  const isOverPlanLimits = plan.isOverPlanLimits;

  // Feature modules.
  const { canUseBudget, canUseGifts, canRemoveBranding } = plan.limits;

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
      unlimited: isPro && UNLIMITED_ON_PRO.has(resource),
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
    isPro,
    isPending,
    isOverPlanLimits,
    isReachedPlanLimits,
    canUseBudget,
    canUseGifts,
    canRemoveBranding,
    meter,
    reachedLimits,
  };
}
