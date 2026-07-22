import type { ReactNode } from "react";
import { usePlan } from "@/pages/admin/hooks/usePlan";
import type { PlanFeature } from "@/pages/admin/plan/plan-config";
import Container from "./container";
import PlanLockedState from "./states/plan-locked-state";
import { AdminPageHeader } from "./admin-page-header";

interface RequirePlanProps {
  /** Feature module the plan must include — required, so every page is accounted for. */
  feature: PlanFeature;
  /** Section title. When set, the upsell renders the page header above the
   *  locked state so the shell (and its mobile menu trigger) survives. */
  title?: string;
  children: ReactNode;
}

/**
 * Plan-entitlement gate: renders children when the event's plan includes the
 * feature, otherwise an UPSELL — a plan limit is an opportunity, not a denial
 * (cf. RequireAccess, which dead-ends). Gated by the DB feature map (canUseFeature),
 * not a tier string, so it stays grandfather-safe. Server RPCs are the real
 * boundary — this is UX. Must render inside the admin shell (after bootstrap).
 */
const RequirePlan = ({ feature, title, children }: RequirePlanProps) => {
  const { canUseFeature } = usePlan();

  if (!canUseFeature(feature)) {
    return (
      <>
        {title && <AdminPageHeader title={title} />}
        <Container className="py-3 sm:py-5" size="full">
          <PlanLockedState feature={feature} />
        </Container>
      </>
    );
  }

  return <>{children}</>;
};

export default RequirePlan;
