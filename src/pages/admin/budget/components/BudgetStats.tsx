import type { FC } from "react";
import { AlertTriangle } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import Odometer from "@/components/animations/animate-odometer";
import { cn } from "@/lib/utils";

import { formatSGD, type BudgetSummary as SummaryData } from "../utils";

type Tone = "good" | "warn" | "bad";

const Stat: FC<{ k: string; value: number | null; tone?: Tone }> = ({
  k,
  value,
  tone,
}) => (
  <div className="min-w-0">
    <div className="text-2xs font-medium text-muted-foreground">{k}</div>
    <div
      className={cn(
        "mt-0.5 font-display text-sm font-bold tabular-nums whitespace-nowrap",
        tone === "good" && "text-success",
        tone === "warn" && "text-warning",
        tone === "bad" && "text-destructive",
      )}
    >
      {value === null ? "—" : <Odometer value={value} prefix="S$" group />}
    </div>
  </div>
);

/** Progress bar + due-soon flag + the four headline figures. Shared by the
 *  whole-wedding overview and the per-day hero so the two never drift apart. */
const BudgetStats: FC<{ summary: SummaryData }> = ({ summary }) => {
  const { budgetTotal, spent, paid, remaining, outstanding, dueSoon, spentPct, paidPct } =
    summary;
  const over = remaining !== null && remaining < 0;

  return (
    <>
      {budgetTotal !== null && (
        <>
          <div className="relative mt-3 mb-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary/35 transition-[width] duration-500 ease-out"
              style={{ width: `${spentPct * 100}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${paidPct * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Spent {Math.round(spentPct * 100)}% of budget</span>
            <span className={cn(over && "font-medium text-destructive")}>
              {over
                ? `${formatSGD(Math.abs(remaining!))} over`
                : `${formatSGD(remaining ?? 0)} left`}
            </span>
          </div>
        </>
      )}

      {dueSoon > 0 && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">
          <AlertTriangle className="size-3.5" />
          {formatSGD(dueSoon)} due now or within 2 weeks
        </div>
      )}

      <Separator className="mt-3.5" />
      <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat k="Spent" value={spent} />
        <Stat k="Paid" value={paid} />
        <Stat
          k="Remaining"
          value={remaining}
          tone={remaining === null ? undefined : over ? "bad" : "good"}
        />
        <Stat
          k="Outstanding"
          value={outstanding}
          tone={outstanding > 0 ? "warn" : undefined}
        />
      </div>
    </>
  );
};

export default BudgetStats;
