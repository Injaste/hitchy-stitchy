import { useState, useEffect } from "react";
import { LayoutGroup, motion } from "framer-motion";
import TaskCardView from "@/pages/admin/tasks/components/TaskCardView";
import TaskStatusIcon from "@/pages/admin/tasks/components/TaskStatusIcon";
import { Separator } from "@/components/ui/separator";
import type { Task, TaskStatus, TaskPriority } from "@/pages/admin/tasks/types";
import type { Member } from "@/pages/admin/members/types";
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

// Two resident cards per column so no panel reads empty.
const RESIDENTS: { task: Task; who: Member[] }[] = [
  { task: mk("t1", "Confirm tea ceremony order", "todo", "medium", "2026-07-30"), who: [SERENE, PRIYA] },
  { task: mk("t2", "Order ang bao boxes", "todo", "low"), who: [] },
  { task: mk("t4", "Finalise banquet menu", "in_progress", "high", "2026-07-15"), who: [HUI_LING, SERENE] },
  { task: mk("t5", "Brief the emcee", "in_progress", null), who: [FAIZ] },
  { task: mk("t6", "Send the invites", "done", null), who: [] },
  { task: mk("t7", "Book the venue", "done", null), who: [SERENE] },
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

export function TasksShowcase() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (p: number) => {
      timeout = setTimeout(() => {
        const next = (p + 1) % PHASES.length;
        setPhase(next);
        advance(next);
      }, PHASES[p].dur);
    };
    advance(phase);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { col: heroCol, visible } = PHASES[phase];
  const heroTask = mk("hero", "Book lion dance troupe", COLUMNS[heroCol].status, "high");
  const residentCount = (i: number) =>
    RESIDENTS.filter((r) => r.task.status === COLUMNS[i].status).length;
  const count = (i: number) => residentCount(i) + (heroCol === i ? 1 : 0);

  return (
    <LayoutGroup>
      <div className="grid h-full grid-cols-3 gap-2.5">
        {COLUMNS.map((col, i) => (
          <div
            key={col.status}
            className="flex h-full min-w-0 flex-col gap-2.5 overflow-hidden rounded-xl bg-task-column p-2.5 ring-1 ring-border/60"
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
                  animate={{ opacity: visible ? 1 : 0 }}
                  transition={{
                    layout: { duration: 0.55, ease: EASE },
                    opacity: { duration: 0.4, ease: EASE },
                  }}
                >
                  <TaskCardView task={heroTask} assigneeMembers={[WEI_JIE]} selfId={SELF_ID} />
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}
