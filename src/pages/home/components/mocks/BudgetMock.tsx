import { useState, useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSGD } from "@/lib/money";

const CAP = 20000;

const EXPENSES = [
  { item: "Banquet dinner", vendor: "Grand Ballroom", amount: 12000 },
  { item: "Photography", vendor: "Lumière Studio", amount: 3800 },
  { item: "Florals", vendor: "Petal & Stem", amount: 2200 },
];

// How many expenses have settled. Steps forward one at a time, holds on full,
// then resets. Everything that animates (stripe fills, the summary bar, the
// running total) changes width/text inside fixed-size boxes — never the row or
// card height — so the card stays put through every cycle.
const PHASES = [
  { paid: 0, dur: 1100 },
  { paid: 1, dur: 1500 },
  { paid: 2, dur: 1500 },
  { paid: 3, dur: 2400 },
];

function AnimatedTotal({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => formatSGD(v));

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, mv]);

  return <motion.span>{text}</motion.span>;
}

function ExpenseRow({
  item,
  vendor,
  amount,
  paid,
}: {
  item: string;
  vendor: string;
  amount: number;
  paid: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{item}</p>
          <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
            {formatSGD(amount)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">{vendor}</p>
        </div>
        {/* Paid stripe — the fill grows inside a fixed-width track, so the row
            height is untouched as it settles. */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-brand"
            initial={false}
            animate={{ width: paid ? "100%" : "0%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Status pill — fixed footprint; only its label/colour swap. */}
      <span
        className={cn(
          "shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-semibold transition-colors w-14 justify-center",
          paid
            ? "bg-success/10 border-success/25 text-success"
            : "bg-muted border-border text-muted-foreground",
        )}
      >
        {paid && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
        {paid ? "Paid" : "Unpaid"}
      </span>
    </div>
  );
}

export function BudgetMock() {
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

  const paidCount = PHASES[phase].paid;
  const paidTotal = EXPENSES.slice(0, paidCount).reduce((s, e) => s + e.amount, 0);
  const pct = Math.min(100, (paidTotal / CAP) * 100);

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
          Wedding Budget
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Summary */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Paid so far</p>
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                <AnimatedTotal value={paidTotal} />
              </p>
            </div>
            <p className="text-xs text-muted-foreground pb-1">
              of {formatSGD(CAP)} budget
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-brand"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Expense rows */}
        <div className="space-y-2">
          {EXPENSES.map((e, i) => (
            <ExpenseRow key={e.item} {...e} paid={i < paidCount} />
          ))}
        </div>
      </div>
    </div>
  );
}
