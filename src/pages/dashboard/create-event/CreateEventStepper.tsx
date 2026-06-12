import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  stepperCheckIn,
  stepperNumberIn,
  stepperConnectorFill,
  STEPPER_NODE_FILL_DELAY,
} from "../animations";
import { STEPS, type StepType } from "../types";

interface CreateEventStepperProps {
  activeStep: StepType;
}

const CreateEventStepper: FC<CreateEventStepperProps> = ({ activeStep }) => {
  const activeIndex = STEPS.indexOf(activeStep);

  // The active step's circle + label hold their fill until the dash arrives —
  // beat 3 of the chain. Works both ways: the step being entered always fills
  // last, whether we advanced into it or came back to it.
  const arriveDelay = (isActive: boolean) =>
    isActive ? STEPPER_NODE_FILL_DELAY : "0s";

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
                style={{ transitionDelay: arriveDelay(isActive) }}
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
                  "text-xs uppercase tracking-widest transition-all",
                  isActive ? "text-primary font-bold" : "text-muted-foreground",
                )}
                style={{ transitionDelay: arriveDelay(isActive) }}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <div className="w-14 h-0.5 mx-3 mb-5 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full bg-primary origin-left"
                  initial={false}
                  animate={{ scaleX: isDone ? 1 : 0 }}
                  transition={stepperConnectorFill}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CreateEventStepper;
