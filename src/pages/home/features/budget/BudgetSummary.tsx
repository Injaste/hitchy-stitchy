import type { FC } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { formatNum } from "@/lib/money";
import BudgetStats from "../components/BudgetStats";
import type { BudgetSummary as SummaryData } from "../types";

interface BudgetSummaryProps {
  summary: SummaryData;
  scopeLabel?: string;
}

/** Static display of the budget hero — no editing, no access gates. */
const BudgetSummary: FC<BudgetSummaryProps> = ({ summary, scopeLabel }) => {
  const { budgetTotal } = summary;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent>
        <div className="min-w-0">
          <div className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
            {scopeLabel ? `${scopeLabel} budget` : "Total budget"}
          </div>
          <div className="mt-0.5">
            {budgetTotal !== null ? (
              <span className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-muted-foreground">
                  S$
                </span>
                <span className="font-display text-3xl font-bold tabular-nums">
                  {formatNum(budgetTotal)}
                </span>
              </span>
            ) : (
              <span className="font-display text-lg font-semibold text-muted-foreground">
                No budget set
              </span>
            )}
          </div>
        </div>
        <BudgetStats summary={summary} />
      </CardContent>
    </Card>
  );
};

export default BudgetSummary;
