import type { ReactNode } from "react";
import { useAccess } from "@/pages/admin/hooks/useAccess";
import type { Resource } from "@/pages/admin/access/types";
import Container from "./container";
import NoAccessState from "./states/no-access-state";

interface RequireAccessProps {
  /** Allowed if the user can read ANY of these resource(s). */
  resource?: Resource | Resource[];
  /** Require the couple/root (the money + identity surfaces). */
  requireSuperAdmin?: boolean;
  children: ReactNode;
}

/**
 * Permission gate (the access boundary): renders children when the member meets
 * the requirement, otherwise a no-access state. A denial here is a dead end —
 * the member simply lacks permission (cf. RequirePlan, where a denial is an
 * upsell). Omitting both props is a pass-through. Server RLS/RPCs are the real
 * boundary — this is UX. Must render inside the admin shell (after bootstrap) so
 * useAccess() has data.
 */
const RequireAccess = ({
  resource,
  requireSuperAdmin,
  children,
}: RequireAccessProps) => {
  const { isSuperAdmin, canRead } = useAccess();

  const resources = resource
    ? Array.isArray(resource)
      ? resource
      : [resource]
    : [];
  const allowed =
    (!requireSuperAdmin || isSuperAdmin) &&
    (resources.length === 0 || resources.some((r) => canRead(r)));

  if (!allowed) {
    return (
      <Container className="py-3 sm:py-5" size="full">
        <NoAccessState />
      </Container>
    );
  }

  return <>{children}</>;
};

export default RequireAccess;
