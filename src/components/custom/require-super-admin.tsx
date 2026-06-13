import type { ReactNode } from "react";
import { useAccess } from "@/pages/admin/hooks/useAccess";
import Container from "./container";
import NoAccessState from "./states/no-access-state";

/**
 * Route-level guard for super-admin-only pages (the money surface — budget,
 * gift envelopes). Renders children only for the couple (is_root / is_bride /
 * is_groom); everyone else gets the no-access state. Server RLS/RPCs are the
 * real boundary — this is UX. Must render inside the admin shell (after
 * bootstrap) so useAccess() has data.
 */
const RequireSuperAdmin = ({ children }: { children: ReactNode }) => {
  const { isSuperAdmin } = useAccess();

  if (!isSuperAdmin) {
    return (
      <Container className="py-3 sm:py-5" size="full">
        <NoAccessState />
      </Container>
    );
  }

  return <>{children}</>;
};

export default RequireSuperAdmin;
