import type { FC } from "react";
import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { formatNum, type BudgetSummary as SummaryData } from "../utils";
import BudgetStats from "./BudgetStats";

interface BudgetOverviewProps {
  summary: SummaryData;
  dayCount: number;
}

/** Whole-wedding roll-up across every day — the headline figure. Read-only: the
 *  grand budget is the sum of each day's cap, set per day on the hero below. */
const BudgetOverview: FC<BudgetOverviewProps> = ({ summary, dayCount }) => (
  <Card className="rounded-2xl border-primary/15 bg-primary/5 shadow-sm">
    <CardContent>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-primary/80">
          <Sparkles className="size-3.5" />
          Whole wedding
        </div>
        <span className="text-2xs font-medium text-muted-foreground">
          {dayCount} days
        </span>
      </div>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-muted-foreground">S$</span>
        <span className="font-display text-3xl font-bold tabular-nums">
          {summary.budgetTotal === null ? "—" : formatNum(summary.budgetTotal)}
        </span>
        {summary.budgetTotal === null && (
          <span className="ml-0.5 text-xs text-muted-foreground">
            no day budgets set yet
          </span>
        )}
      </div>

      <BudgetStats summary={summary} />
    </CardContent>
  </Card>
);

export default BudgetOverview;
