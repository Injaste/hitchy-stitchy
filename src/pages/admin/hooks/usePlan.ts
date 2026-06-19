import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { UNLIMITED_ON_PRO, type PlanResource } from "../plan/plan-config";

/** Client plan gate — UX only (the server's RLS + RPCs are the real boundary).
 *  Mirrors useAccess: read the store, expose reactive entitlement helpers. */
export function usePlan() {
  const plan = useAdminStore((s) => s.plan);

  const isPro = plan.tier === "pro";
  /** activated_at NULL = a 2nd+ event awaiting payment → write-locked. */
  const isPending = plan.activatedAt === null;
  /** over the effective countable caps (trial expiry / refund) → edit-locked. */
  const isOver = plan.isOver;
  /** any state that blocks writes (the RPCs enforce; this drives read-only UX). */
  const isLocked = isPending || isOver;

  // Feature modules.
  const { canUseBudget, canUseGifts, canRemoveBranding } = plan.limits;

  /** Usage meter for a countable resource. `unlimited` hides the number for the
   *  Pro tiers we market as unlimited (the cap is a soft ceiling). */
  const meter = (resource: PlanResource) => {
    const used = plan.usage[resource];
    const max =
      resource === "guests"
        ? plan.limits.maxGuests
        : resource === "days"
          ? plan.limits.maxDays
          : resource === "pages"
            ? plan.limits.maxInvitationPages
            : plan.limits.maxMembers;
    return {
      used,
      max,
      unlimited: isPro && UNLIMITED_ON_PRO.has(resource),
      atLimit: used >= max,
      remaining: Math.max(0, max - used),
    };
  };

  return {
    plan,
    isPro,
    isPending,
    isOver,
    isLocked,
    canUseBudget,
    canUseGifts,
    canRemoveBranding,
    meter,
  };
}
