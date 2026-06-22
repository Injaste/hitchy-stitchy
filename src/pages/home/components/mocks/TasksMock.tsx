import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Circle, CircleDot, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
] as const;

// Static background cards so the board reads like a real one — these stay put.
// One per column, always on the same grid row.
const STATIC = [
  { col: 0, title: "Send the invitations", tag: "Stationery" },
  { col: 1, title: "Confirm the caterer", tag: "Catering" },
  { col: 2, title: "Book the venue", tag: "Venue", done: true },
];

// The hero card travels across the bottom grid row. Each phase only changes its
// column (and visibility) — it stays the same mounted element on the same row,
// so framer's `layout` slides it left→right and the board's height never moves.
// The reset (done→todo) is done while faded out, so the backward slide is never
// seen and the bottom row always reserves the hero's height in every column.
const PHASES = [
  { col: 0, visible: true, dur: 2000 },
  { col: 1, visible: true, dur: 2000 },
  { col: 2, visible: true, dur: 2400 },
  { col: 2, visible: false, dur: 500 }, // fade out on Done
  { col: 0, visible: false, dur: 350 }, // reposition to To do while hidden
];

function StatusDot({ col }: { col: number }) {
  if (col === 2)
    return (
      <CircleCheck
        className="size-3.5 shrink-0 text-success"
        strokeWidth={2.25}
      />
    );
  if (col === 1)
    return (
      <CircleDot
        className="size-3.5 shrink-0 text-primary fill-primary/15"
        strokeWidth={2.25}
      />
    );
  return (
    <Circle className="size-3.5 shrink-0 text-border" strokeWidth={2.25} />
  );
}

function MiniCard({
  title,
  tag,
  col,
  hero,
}: {
  title: string;
  tag: string;
  col: number;
  hero?: boolean;
}) {
  const done = col === 2;
  return (
    <div
      className={cn(
        "flex h-full min-h-13 flex-col justify-between rounded-lg border p-2 bg-card",
        hero
          ? "border-primary/30 shadow-sm shadow-primary/10 ring-1 ring-primary/10"
          : "border-border",
      )}
    >
      <div className="flex items-start gap-1.5">
        <StatusDot col={col} />
        <p
          className={cn(
            "text-2xs font-medium leading-snug line-clamp-2",
            done ? "text-muted-foreground line-through" : "text-foreground",
          )}
        >
          {title}
        </p>
      </div>
      <span className="mt-1.5 self-start rounded-full border border-primary/15 bg-primary/5 px-1.5 py-0.5 text-3xs font-medium text-primary">
        {tag}
      </span>
    </div>
  );
}

export function TasksMock() {
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

  // Header counts reflect where the hero currently sits.
  const count = (i: number) => 1 + (visible && heroCol === i ? 1 : 0);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden select-none">
      {/* Chrome */}
      <div className="bg-muted/60 border-b border-border px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <span className="text-xs text-muted-foreground font-medium mx-auto">
          Wedding Tasks
        </span>
      </div>

      {/* Board — a single grid; every card (static + hero) is a direct child
          placed by column/row, so the grid's row sizing keeps the height fixed
          no matter which column holds the travelling hero. */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {COLUMNS.map((c, i) => (
            <div
              key={c.key}
              style={{ gridColumn: i + 1, gridRow: 1 }}
              className="flex items-center justify-between px-0.5"
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
            <div key={s.title} style={{ gridColumn: s.col + 1, gridRow: 2 }}>
              <MiniCard title={s.title} tag={s.tag} col={s.done ? 2 : s.col} />
            </div>
          ))}

          <motion.div
            layout
            style={{ gridColumn: heroCol + 1, gridRow: 3 }}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{
              layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            <MiniCard
              hero
              title="Choose the florals"
              tag="Florals"
              col={heroCol}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
