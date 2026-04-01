import { AnimatePresence, motion } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";

import { useAuthGate } from "./hook";

import SignIn from "./SignIn";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthGate();

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
