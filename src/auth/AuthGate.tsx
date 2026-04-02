import { AnimatePresence } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";

import { useAuthListener, useIsAuthenticatedQuery } from "./queries";

import SignIn from ".";
import Loading from "@/components/custom/loading";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: isAuthenticated, isLoading } = useIsAuthenticatedQuery();
  useAuthListener();

  if (isLoading) return <Loading />;

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
