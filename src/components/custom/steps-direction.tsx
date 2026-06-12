import { createContext, useContext } from "react";
import { AnimatePresence } from "framer-motion";
import ComponentFade from "../animations/animate-component-fade";

interface StepsContextValue<T extends string> {
  activeStep: T;
  goTo: (step: T) => void;
}

const StepsContext = createContext<StepsContextValue<string> | null>(null);

export function useSteps<T extends string = never>() {
  const ctx = useContext(StepsContext) as StepsContextValue<T> | null;
  if (!ctx) throw new Error("useSteps must be used within Steps");
  return ctx;
}

interface StepsProps<T extends string> {
  value: T;
  onChange: (step: T) => void;
  children: React.ReactNode;
}

// Steps crossfade (with a soft blur) on change — no directional slide, so `goTo`
// is just `onChange`.
export function StepsDirection<T extends string>({
  value,
  onChange,
  children,
}: StepsProps<T>) {
  return (
    <StepsContext.Provider
      value={{ activeStep: value, goTo: onChange as (step: string) => void }}
    >
      <AnimatePresence mode="wait">
        <ComponentFade key={value} useBlur>
          {children}
        </ComponentFade>
      </AnimatePresence>
    </StepsContext.Provider>
  );
}
