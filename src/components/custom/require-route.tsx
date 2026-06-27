import type { ReactNode } from "react";
import type { Resource } from "@/pages/admin/access/types";
import type { PlanFeature } from "@/pages/admin/plan/plan-config";
import RequireAccess from "./require-access";
import RequirePlan from "./require-plan";

interface RequireRouteProps {
  resource?: Resource | Resource[];
  requireSuperAdmin?: boolean;
  /** Required — every page declares its plan feature (none omitted). */
  feature: PlanFeature;
  children: ReactNode;
}

/**
 * Single route guard = access THEN plan, composed from the two single-purpose
 * guards. Access is checked first (a member who can't reach a page never sees an
 * upsell for it); plan second (an entitled member on too low a tier gets the
 * upsell). Lives in a Route's `element=` — it can't replace <Route> itself, since
 * <Routes> only accepts <Route>/<Fragment> children (it inspects, never renders
 * them). `feature` is required so no page escapes plan accounting.
 */
const RequireRoute = ({
  resource,
  requireSuperAdmin,
  feature,
  children,
}: RequireRouteProps) => (
  <RequireAccess resource={resource} requireSuperAdmin={requireSuperAdmin}>
    <RequirePlan feature={feature}>{children}</RequirePlan>
  </RequireAccess>
);

export default RequireRoute;
