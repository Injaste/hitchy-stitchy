import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TaskCardView from "@/pages/admin/tasks/components/TaskCardView";
import type { Task, TaskStatus, TaskPriority } from "@/pages/admin/tasks/types";
import type { Member } from "@/pages/admin/members/types";
import { SERENE, PRIYA, HUI_LING, WEI_JIE, FAIZ, SELF_ID } from "./sampleTeam";

// Real TaskCardView on a fixed-height mini board (the app's board is dnd-coupled,
// so the 3-column scaffold is showcase glue; the cards are the real component,
// with real assignee avatars — Serene = "you" renders green). A hero card
// travels To do → In progress → Done across the bottom row.
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

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
] as const;

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

const STATIC: { col: number; row: number; task: Task; who: Member[] }[] = [
  { col: 0, row: 2, task: mk("t1", "Confirm tea ceremony order", "todo", "medium", "2026-07-30"), who: [SERENE, PRIYA] },
  { col: 0, row: 3, task: mk("t2", "Order ang bao boxes", "todo", "low"), who: [] },
  { col: 0, row: 4, task: mk("t3", "Chase RSVP stragglers", "todo", null), who: [PRIYA] },
  { col: 1, row: 2, task: mk("t4", "Finalise banquet menu", "in_progress", "high", "2026-07-15"), who: [HUI_LING, SERENE] },
  { col: 1, row: 3, task: mk("t5", "Brief the emcee", "in_progress", null), who: [FAIZ] },
  { col: 2, row: 2, task: mk("t6", "Send the invites", "done", null), who: [] },
  { col: 2, row: 3, task: mk("t7", "Book the venue", "done", null), who: [SERENE] },
];

const HERO_ROW = 5;

// Hero travels across the bottom row; reset slides while faded out, and the hero
// always occupies the bottom row so the board height never moves.
const PHASES = [
  { col: 0, visible: true, dur: 2000 },
  { col: 1, visible: true, dur: 2000 },
  { col: 2, visible: true, dur: 2400 },
  { col: 2, visible: false, dur: 500 },
  { col: 0, visible: false, dur: 350 },
];

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
  const heroTask = mk("hero", "Book lion dance troupe", STATUSES[heroCol], "high");
  const staticCount = (i: number) => STATIC.filter((s) => s.col === i).length;
  const count = (i: number) => staticCount(i) + (visible && heroCol === i ? 1 : 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-lg select-none h-full">
      <div className="grid grid-cols-3 gap-2 auto-rows-min">
        {COLUMNS.map((c, i) => (
          <div
            key={c.key}
            style={{ gridColumn: i + 1, gridRow: 1 }}
            className="flex items-center justify-between px-0.5 pb-1"
          >
            <span className="text-3xs uppercase tracking-wide font-semibold text-muted-foreground">
              {c.label}
            </span>
            <span className="text-3xs text-muted-foreground/60 tabular-nums">
              {count(i)}
            </span>
          </div>
        ))}

        {STATIC.map((s) => (
          <div key={s.task.id} style={{ gridColumn: s.col + 1, gridRow: s.row }}>
            <TaskCardView
              task={s.task}
              assigneeMembers={s.who.length ? s.who : undefined}
              selfId={SELF_ID}
            />
          </div>
        ))}

        <motion.div
          layout
          style={{ gridColumn: heroCol + 1, gridRow: HERO_ROW }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{
            layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <TaskCardView task={heroTask} assigneeMembers={[WEI_JIE]} selfId={SELF_ID} />
        </motion.div>
      </div>
    </div>
  );
}
