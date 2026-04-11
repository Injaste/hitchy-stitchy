import { AnimatePresence } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";

import { useAuthListener, useIsAuthenticatedQuery } from "./queries";

import SignIn from ".";
import LoadingState from "@/components/custom/loading-state";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: isAuthenticated, isLoading } = useIsAuthenticatedQuery();
  useAuthListener();

  if (isLoading) return <LoadingState />;

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <ComponentFade key="login">
          <SignIn />
        </ComponentFade>
      ) : (
        <ComponentFade key="admin">{children}</ComponentFade>
      )}
    </AnimatePresence>
  );
}
