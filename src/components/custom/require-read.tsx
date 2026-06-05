import type { ReactNode } from "react";
import { useAccess } from "@/pages/admin/hooks/useAccess";
import type { Resource } from "@/pages/admin/access/types";
import Container from "./container";
import NoAccessState from "./states/no-access-state";

interface RequireReadProps {
  /** One resource or multiple — allowed if the user can read ANY of them. */
  resource: Resource | Resource[];
  children: ReactNode;
}

/**
 * Route-level guard: renders children when the user has read access to the given
 * resource(s), otherwise renders a friendly no-access state.
 * Must be rendered inside the admin shell (after bootstrap) so useAccess() has data.
 */
const RequireRead = ({ resource, children }: RequireReadProps) => {
  const { canRead } = useAccess();
  const resources = Array.isArray(resource) ? resource : [resource];
  const allowed = resources.some((r) => canRead(r));

  if (!allowed) {
    return (
      <Container className="py-3 sm:py-5" size="full">
        <NoAccessState />
      </Container>
    );
  }

  return <>{children}</>;
};

export default RequireRead;
