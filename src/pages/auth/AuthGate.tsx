import { AnimatePresence, motion } from "framer-motion";

import { ComponentFade } from "@/components/animations/component-fade";

import { useAuthGate } from "./hook";

import Login from "./AuthForm";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthGate();

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <ComponentFade key="login">
          <Login />
        </ComponentFade>
      ) : (
        <ComponentFade key="admin">{children}</ComponentFade>
      )}
    </AnimatePresence>
  );
}
