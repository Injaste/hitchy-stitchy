import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { stepperCheckIn, stepperNumberIn } from "../animations";
import { STEPS, type StepType } from "../types";

interface CreateEventStepperProps {
  activeStep: StepType;
}

const CreateEventStepper: FC<CreateEventStepperProps> = ({ activeStep }) => {
  const activeIndex = STEPS.indexOf(activeStep);

  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((label, i) => {
        const isActive = label === activeStep;
        const isDone = i < activeIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                  isDone && "bg-primary/20 text-primary",
                  !isActive && !isDone && "bg-muted text-muted-foreground",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {isDone ? (
                    <motion.span
                      key="check"
                      variants={stepperCheckIn}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Check className="size-4" strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key={label}
                      variants={stepperNumberIn}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {i + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <span
                className={cn(
                  "text-xs uppercase tracking-widest transition-colors",
                  isActive ? "text-primary font-bold" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "w-14 h-px mx-3 mb-5 transition-colors",
                  isDone ? "bg-primary/40" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CreateEventStepper;
