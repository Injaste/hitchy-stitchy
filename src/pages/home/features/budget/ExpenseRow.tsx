import type { FC } from "react";
import { AlertTriangle, Check, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import NotesTooltip from "@/components/custom/notes-tooltip";
import DataTableRow from "@/components/custom/tables/data-table-row";
import { formatSGD } from "@/lib/money";

import {
  dueInfo,
  statusOf,
  stripeColor,
  type DueUrgency,
} from "../utils";
import type { Expense } from "../types";

export const ROW_COLS =
  "grid-cols-[minmax(0,1fr)_3.5rem_5rem] sm:grid-cols-[minmax(0,1fr)_8rem_3.5rem_5rem]";

const DUE_TONE: Record<DueUrgency, string> = {
  overdue: "font-semibold text-destructive",
  soon: "font-semibold text-warning",
  upcoming: "text-muted-foreground",
  settled: "text-muted-foreground/60",
  none: "text-muted-foreground/60",
};

const PayerChip: FC<{ payer: string; className?: string }> = ({
  payer,
  className,
}) => (
  <Badge variant="secondary" className={cn("truncate", className)}>
    {payer}
  </Badge>
);

interface ExpenseRowProps {
  expense: Expense;
  onClick: (expense: Expense) => void;
}

const ExpenseRow: FC<ExpenseRowProps> = ({ expense, onClick }) => {
  const status = statusOf(expense);
  const due = dueInfo(expense);
  const balance = expense.amount - expense.paid;
  const stripe = stripeColor(expense);

  return (
    <DataTableRow onClick={() => onClick(expense)} stripeColor={stripe}>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold leading-tight">
            {expense.item}
          </span>
          <NotesTooltip notes={expense.notes} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="min-w-0 truncate">{expense.vendor_name ?? "—"}</span>
          {expense.payer && (
            <PayerChip
              payer={expense.payer}
              className="max-w-28 shrink-0 sm:hidden"
            />
          )}
        </div>
      </div>

      <div className="hidden min-w-0 items-center sm:flex">
        {expense.payer ? (
          <PayerChip payer={expense.payer} className="max-w-full" />
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </div>

      <div
        className={cn(
          "inline-flex items-center gap-1 text-xs whitespace-nowrap",
          DUE_TONE[due.urgency],
        )}
      >
        {due.urgency === "settled" ? (
          <Check className="size-3.5" />
        ) : due.urgency === "overdue" ? (
          <>
            <AlertTriangle className="size-3 shrink-0" />
            {due.label}
          </>
        ) : due.urgency === "soon" ? (
          <>
            <Clock className="size-3 shrink-0" />
            {due.label}
          </>
        ) : due.urgency === "upcoming" ? (
          due.label
        ) : (
          "—"
        )}
      </div>

      <div className="text-right">
        <div className="font-display text-sm font-bold tabular-nums">
          {formatSGD(expense.amount)}
        </div>
        {status === "partial" && (
          <div className="text-2xs font-medium leading-tight text-warning tabular-nums">
            {formatSGD(balance)} left
          </div>
        )}
      </div>
    </DataTableRow>
  );
};

export default ExpenseRow;
