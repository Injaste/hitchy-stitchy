import type { FC } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { listItemReveal, listLayoutTransition } from "@/lib/animations";
import NotesTooltip from "@/components/custom/notes-tooltip";
import { formatSGD } from "@/lib/money";

import {
  dueInfo,
  statusOf,
  stripeColor,
  type DueUrgency,
} from "../utils";
import type { Expense } from "../types";

/** Shared sheet column template — header, rows, and grand total stay in sync.
 *  Mobile: item · due · amount.  Desktop (sm+): item · paid-by · due · amount. */
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
    <motion.button
      type="button"
      layout="position"
      variants={listItemReveal}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={listLayoutTransition}
      onClick={() => onClick(expense)}
      className="relative block w-full cursor-pointer overflow-hidden border-b border-border text-left transition-colors last:border-b-0 hover:bg-accent/40"
    >
      {stripe && (
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-full"
          style={{ backgroundColor: stripe }}
        />
      )}

      {/* Padding lives here, not on the button, so the height tween can collapse
          the row fully to 0 on exit instead of leaving a padding stub. */}
      <div className={cn("grid items-center gap-x-2 py-2.5 pr-3 pl-4", ROW_COLS)}>
        {/* Item + vendor. Payer rides the subline only on mobile (no column there). */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold leading-tight">
              {expense.item}
            </span>
            <NotesTooltip notes={expense.notes} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="min-w-0 truncate">
              {expense.vendor_name ?? "—"}
            </span>
            {expense.payer && (
              <PayerChip
                payer={expense.payer}
                className="max-w-28 shrink-0 sm:hidden"
              />
            )}
          </div>
        </div>

        {/* Paid by — its own column on desktop only. */}
        <div className="hidden min-w-0 items-center sm:flex">
          {expense.payer ? (
            <PayerChip payer={expense.payer} className="max-w-full" />
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </div>

        {/* Due */}
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

        {/* Amount, with the balance owed surfaced only when partially paid. */}
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
      </div>
    </motion.button>
  );
};

export default ExpenseRow;
