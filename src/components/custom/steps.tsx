import { createContext, useContext, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ComponentSlide from "../animations/animate-component-slide";

type StepDirection = 1 | -1 | 0;

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
  order: readonly T[];
  onChange: (step: T) => void;
  children: React.ReactNode;
}

export function Steps<T extends string>({
  value,
  order,
  onChange,
  children,
}: StepsProps<T>) {
  const prevRef = useRef(value);
  const [direction, setDirection] = useState<StepDirection>(0);

  const goTo = (next: T) => {
    const prevIdx = order.indexOf(prevRef.current);
    const nextIdx = order.indexOf(next);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    prevRef.current = next;
    onChange(next);
  };

  return (
    <StepsContext.Provider
      value={{ activeStep: value, goTo: goTo as (step: string) => void }}
    >
      <AnimatePresence mode="wait">
        <ComponentSlide key={value} direction={direction}>
          {children}
        </ComponentSlide>
      </AnimatePresence>
    </StepsContext.Provider>
  );
}
