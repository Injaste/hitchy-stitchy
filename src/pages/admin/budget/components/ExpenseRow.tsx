import { memo, type FC } from "react";
import { AlertTriangle, Check, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import NotesTooltip from "@/components/custom/notes-tooltip";
import DataTableRow from "@/components/custom/tables/data-table-row";
import { formatSGD } from "@/lib/money";

import { useVendorLookup } from "../../vendors/queries";
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

const ExpenseRow: FC<ExpenseRowProps> = memo(({ expense, onClick }) => {
  const vendors = useVendorLookup();
  const status = statusOf(expense);
  const due = dueInfo(expense);
  const balance = expense.amount - expense.paid;
  const stripe = stripeColor(expense);

  // Always read LIVE off the link, so a rename shows through immediately. Nothing
  // is cached on the expense: deleting a vendor clears vendor_id (ON DELETE SET
  // NULL) and the row falls back to "—", which the delete modal warns about.
  const vendorLabel =
    (expense.vendor_id && vendors.get(expense.vendor_id)?.name) || "—";

  return (
    <DataTableRow onClick={() => onClick(expense)} stripeColor={stripe}>
      {/* Item + vendor. Payer rides the subline only on mobile (no column there). */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold leading-tight">
            {expense.item}
          </span>
          <NotesTooltip notes={expense.notes} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="min-w-0 truncate">{vendorLabel}</span>
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
    </DataTableRow>
  );
});

export default ExpenseRow;
