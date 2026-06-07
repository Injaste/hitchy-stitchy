import { Navigate, useLocation } from "react-router-dom";

import ComponentFade from "@/components/animations/animate-component-fade";
import LoadingState from "@/components/custom/states/loading-state";

import { useAuthListener, useIsAuthenticatedQuery } from "./queries";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data: isAuthenticated, isLoading } = useIsAuthenticatedQuery();
  useAuthListener();

  if (isLoading) return <LoadingState />;

  if (!isAuthenticated) {
    // Send unauthenticated visitors to /login, remembering where they were
    // headed (e.g. a bookmarked /:slug/admin) so login can return them there.
    // pathname+search only — the login page re-validates it as same-origin.
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <ComponentFade>{children}</ComponentFade>;
}
