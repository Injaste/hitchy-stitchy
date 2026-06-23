import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutGroup, motion } from "framer-motion";
import TaskCardView from "@/pages/home/features/tasks/TaskCard";
import TaskStatusIcon from "@/pages/home/features/tasks/TaskStatusIcon";
import { Separator } from "@/components/ui/separator";
import type { Task, TaskStatus, TaskPriority } from "../../features/types";
import type { Member } from "../../features/types";
import { SERENE, PRIYA, HUI_LING, WEI_JIE, FAIZ, SELF_ID } from "./sampleTeam";

// A mini board that mirrors the real TasksSection chrome — each column a
// bg-task-column panel with a status-icon header + count + separator, cards
// stacked naturally (the app's board is dnd-coupled, so the columns are
// showcase glue; the cards are the real TaskCardView). A hero card is dragged
// To do → In progress → Done; layoutId animates it across the panels.
const mk = (
  id: string,
  title: string,
  status: TaskStatus,
  priority: TaskPriority | null,
  due_at: string | null = null,
): Task => ({
  id,
  event_id: "demo",
  created_by: "demo",
  title,
  details: null,
  label: null,
  status,
  priority,
  position: 0,
  assignees: [],
  due_at,
  completed_at: null,
  archived_at: null,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
});

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "done", label: "Done" },
];

// Two resident cards per column so no panel reads empty. Culture-specific to-dos
// go to someone who'd actually know that custom — kompang → Faiz (Malay),
// mehndi → Priya (Indian), lion dance → Wei Jie (Chinese, the traveling hero);
// neutral tasks fall to the couple/coordinator.
const RESIDENTS: { task: Task; who: Member[] }[] = [
  { task: mk("t1", "Confirm kompang group", "todo", "medium", "2026-07-30"), who: [FAIZ] },
  { task: mk("t2", "Book mehndi artist", "todo", "low"), who: [PRIYA] },
  { task: mk("t4", "Finalise banquet menu", "in_progress", "high", "2026-07-15"), who: [HUI_LING, SERENE] },
  { task: mk("t5", "Brief the emcee", "in_progress", null), who: [SERENE] },
  { task: mk("t6", "Send the invites", "done", null), who: [] },
  { task: mk("t7", "Book the venue", "done", null), who: [WEI_JIE] },
];

// The hero rides To do → In progress → Done, then fades out and teleports back
// to To do while hidden (so the loop never animates a backwards sweep).
const PHASES = [
  { col: 0, visible: true, dur: 2000 },
  { col: 1, visible: true, dur: 2000 },
  { col: 2, visible: true, dur: 2400 },
  { col: 2, visible: false, dur: 500 },
  { col: 0, visible: false, dur: 350 },
];

const EASE = [0.16, 1, 0.3, 1] as const;

// Phase 2 = hero sitting in Done. Clicking the hero jumps straight here; the
// scheduler then carries it on through the fade-out/reset like any other phase.
const DONE_PHASE = 2;

export function TasksShowcase() {
  const [phase, setPhase] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const goTo = useCallback((p: number) => {
    clearTimeout(timer.current);
    setPhase(p);
    timer.current = setTimeout(() => goTo((p + 1) % PHASES.length), PHASES[p].dur);
  }, []);

  useEffect(() => {
    goTo(0);
    return () => clearTimeout(timer.current);
  }, [goTo]);

  const { col: heroCol, visible } = PHASES[phase];
  const heroTask = mk("hero", "Book lion dance troupe", COLUMNS[heroCol].status, "high");
  const residentCount = (i: number) =>
    RESIDENTS.filter((r) => r.task.status === COLUMNS[i].status).length;
  const count = (i: number) => residentCount(i) + (heroCol === i ? 1 : 0);

  return (
    <LayoutGroup>
      <div className="flex flex-col gap-2.5 md:grid md:h-full md:grid-cols-3">
        {COLUMNS.map((col, i) => (
          <div
            key={col.status}
            className="flex min-w-0 flex-col gap-2.5 rounded-xl bg-task-column p-2.5 ring-1 ring-border/60 md:h-full"
          >
            <div className="flex items-center gap-1.5">
              <TaskStatusIcon status={col.status} />
              <span className="truncate text-2xs font-display font-medium text-foreground/70">
                {col.label}
              </span>
              <span className="ml-auto text-2xs tabular-nums text-muted-foreground">
                {count(i)}
              </span>
            </div>
            <Separator />

            <div className="flex flex-col gap-2.5">
              {RESIDENTS.filter((r) => r.task.status === col.status).map(
                ({ task, who }) => (
                  <motion.div key={task.id} layout transition={{ layout: { duration: 0.45, ease: EASE } }}>
                    <TaskCardView
                      task={task}
                      assigneeMembers={who.length ? who : undefined}
                      selfId={SELF_ID}
                    />
                  </motion.div>
                ),
              )}
              {heroCol === i && (
                <motion.div
                  layoutId="hero-card"
                  layout
                  // Lift above the column panels so it travels over the gap
                  // (not behind the next column) while moving.
                  className="relative z-20"
                  animate={{ opacity: visible ? 1 : 0 }}
                  transition={{
                    layout: { duration: 0.55, ease: EASE },
                    opacity: { duration: 0.4, ease: EASE },
                  }}
                >
                  <TaskCardView
                    task={heroTask}
                    assigneeMembers={[WEI_JIE]}
                    selfId={SELF_ID}
                    onToggle={() => goTo(DONE_PHASE)}
                    onOpen={() => goTo(DONE_PHASE)}
                  />
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}
