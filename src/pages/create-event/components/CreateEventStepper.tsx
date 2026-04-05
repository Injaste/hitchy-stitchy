import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS, type StepType } from "../types";

interface CreateEventStepperProps {
  activeStep: StepType;
}

const CreateEventStepper: FC<CreateEventStepperProps> = ({ activeStep }) => {
  const activeIndex = STEPS.indexOf(activeStep);

  return (
    <div className="flex items-center justify-center mb-6">
      {STEPS.map((label, i) => {
        const isActive = label === activeStep;
        const isDone = i < activeIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isActive && "bg-primary text-primary-foreground shadow",
                  isDone && "bg-primary/20 text-primary",
                  !isActive && !isDone && "bg-muted text-muted-foreground",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {isDone ? (
                    <motion.span
                      key="check"
                      variants={{
                        initial: { scale: 0, opacity: 0 },
                        animate: {
                          scale: 1,
                          opacity: 1,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                            delay: 0.1,
                          },
                        },
                        exit: {
                          scale: 0,
                          opacity: 0,
                          transition: {
                            duration: 0.18,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        },
                      }}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key={label}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {i + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wide transition-colors",
                  isActive ? "text-primary font-bold" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "w-8 h-px mx-2 mb-4 transition-colors",
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
