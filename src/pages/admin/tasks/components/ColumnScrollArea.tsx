import { useEffect, useRef, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useRegisterScrollSource } from "@/hooks/use-register-scroll-source";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";
import { useIsMobile } from "@/hooks/use-mobile";
import ScrollGradient from "@/components/custom/scroll-gradient";
import { taskCardEnter, taskCardLayoutTransition } from "@/lib/animations";

import type { Task, TaskStatus } from "../types";
import { useTaskColumnDrop, useColumnIsDragOver } from "../hooks/useTaskDnd";
import TaskCard from "./TaskCard";
import { ColumnEndGhost } from "./TaskCardGhost";

interface ColumnScrollAreaProps {
  status: TaskStatus;
  tasks: Task[];
  sectionDelay: number;
}

// Cards stagger in only on the very first render of this column —
// after that, adds / removes / reorders animate immediately so the
// stagger never replays on board updates.
const SECTION_DURATION = 0.25;
const CARD_STAGGER = 0.04;

/**
 * The per-column scroll surface. Owns:
 *   - The scroll element (reserves scrollbar gutter, thin scrollbar)
 *   - Top / bottom scroll gradients via the shared ScrollGradient
 *   - The drop target for empty-area drops (dropZoneRef)
 *   - The motion list of card wrappers, with `layout` enabling smooth
 *     sibling shifts when a ghost mounts / cards reorder
 *   - The column-end drop ghost (when dragOver.anchor === "end")
 *
 * As a grid item in BoardColumn's `minmax(0, 1fr)` row, the outer
 * wrapper gets a definite height. Its inner grid (`grid-rows-[1fr]`)
 * then lets the scroll element fill that height without needing
 * `h-full`.
 */
const ColumnScrollArea: FC<ColumnScrollAreaProps> = ({
  status,
  tasks,
  sectionDelay,
}) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const {
    scrollRef,
    canScrollUp,
    canScrollDown,
    onScroll: onScrollUpdate,
  } = useScrollVisibility();

  useRegisterScrollSource(scrollRef, !isMobile);
  useTaskColumnDrop(dropZoneRef, status);
  const isOver = useColumnIsDragOver(status);

  // Stagger card entrance only on the first render of this column.
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);
  const isInitial = !mountedRef.current;
  const cardBaseDelay = isInitial ? sectionDelay + SECTION_DURATION * 0.6 : 0;
  const cardStagger = isInitial ? CARD_STAGGER : 0;

  return (
    <div className="relative lg:min-h-0">
      <ScrollGradient
        side="top"
        visible={canScrollUp}
        fromClass="from-card/60"
      />
      <div
        ref={scrollRef}
        onScroll={onScrollUpdate}
        className="flex flex-col gap-3 lg:absolute lg:inset-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable] lg:[scrollbar-width:thin] px-1"
      >
        <div
          ref={dropZoneRef}
          className={cn(
            "flex flex-col gap-3 min-h-[60px] rounded-xl ring-1 ring-transparent transition-colors duration-150",
            isOver && "ring-primary/40 bg-primary/5",
          )}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {tasks.map((task, i) => (
              <motion.div
                key={task.id}
                layout
                custom={{
                  baseDelay: cardBaseDelay,
                  stagger: cardStagger,
                  index: i,
                }}
                variants={taskCardEnter}
                initial="hidden"
                animate="show"
                exit="exit"
                transition={{ layout: taskCardLayoutTransition }}
                className="first:pt-1 last:pb-1"
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
          </AnimatePresence>
          <ColumnEndGhost status={status} />
        </div>
      </div>
      <ScrollGradient
        side="bottom"
        visible={canScrollDown}
        fromClass="from-card/60"
      />
    </div>
  );
};

export default ColumnScrollArea;
