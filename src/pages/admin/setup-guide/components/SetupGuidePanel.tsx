import type { ReactNode, RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Minus, X } from "lucide-react";

import ComponentFade from "@/components/animations/animate-component-fade";
import { ScrollView } from "@/components/custom/scroll-view";
import type { SetupGroup } from "../setupSteps";
import { ProgressBorder } from "./ProgressBorder";
import SetupStepRow from "./SetupStepRow";

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors enabled:hover:bg-muted enabled:hover:text-foreground disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** The expanded guide panel: header, group prev/next nav, and the current
 *  group's steps in a fixed-height scroll area. Its border is the progress
 *  meter. Presentational — the orchestrator owns state and passes handlers. */
export default function SetupGuidePanel({
  panelRef,
  pct,
  isComplete,
  doneCount,
  totalCount,
  group,
  index,
  groupCount,
  onPrev,
  onNext,
  onMinimize,
  onDismiss,
}: {
  panelRef: RefObject<HTMLDivElement | null>;
  pct: number;
  isComplete: boolean;
  doneCount: number;
  totalCount: number;
  group: SetupGroup;
  index: number;
  groupCount: number;
  onPrev: () => void;
  onNext: () => void;
  onMinimize: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "bottom right" }}
      className="relative w-[280px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg"
    >
      <ProgressBorder pct={pct} />

      <div className="flex items-start gap-1 px-4 pt-3.5 pb-3">
        <div className="min-w-0 flex-1">
          {isComplete ? (
            <p className="font-display text-xs font-medium">
              You're all set! 🎉
            </p>
          ) : (
            <>
              <p className="font-display text-xs font-medium">
                Get your event ready
              </p>
              <p className="text-2xs text-muted-foreground">
                {doneCount} of {totalCount} done
              </p>
            </>
          )}
        </div>
        <IconButton label="Minimize" onClick={onMinimize}>
          <Minus className="size-4" />
        </IconButton>
        <IconButton label="Dismiss" onClick={onDismiss}>
          <X className="size-4" />
        </IconButton>
      </div>

      <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
        <IconButton
          label="Previous group"
          disabled={index === 0}
          onClick={onPrev}
        >
          <ChevronLeft className="size-4" />
        </IconButton>
        <div className="flex-1 text-center">
          <p className="text-xs font-medium">{group.label}</p>
        </div>
        <IconButton
          label="Next group"
          disabled={index === groupCount - 1}
          onClick={onNext}
        >
          <ChevronRight className="size-4" />
        </IconButton>
      </div>

      <div className="border-t border-border pt-1 px-1.75 pb-0.75">
        <div style={{ height: 160 }}>
          <ScrollView
            gradientTop
            gradientBottom
            gradientChevron
            hideScrollbar
            gradientClass="from-popover rounded-b-lg"
            size="thin"
          >
            <AnimatePresence mode="wait">
              <ComponentFade key={group.id} useBlur className="flex flex-col">
                {group.steps.map((step) => (
                  <SetupStepRow key={step.id} step={step} />
                ))}
              </ComponentFade>
            </AnimatePresence>
          </ScrollView>
        </div>
      </div>
    </motion.div>
  );
}
