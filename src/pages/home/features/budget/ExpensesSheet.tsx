import type { FC } from "react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/tables/data-table";
import DataTableTotalRow from "@/components/custom/tables/data-table-total-row";
import { formatSGD } from "@/lib/money";
import type { Expense } from "../types";

import ExpenseRow, { ROW_COLS } from "./ExpenseRow";

const COLUMNS: DataTableColumn[] = [
  { label: "Item" },
  { label: "Paid by", hideBelowSm: true },
  { label: "Due" },
  { label: "Amount", align: "right" },
];

interface ExpensesSheetProps {
  expenses: Expense[];
  totalSpent: number;
  totalPaid: number;
  onRowClick: (expense: Expense) => void;
}

const ExpensesSheet: FC<ExpensesSheetProps> = ({
  expenses,
  totalSpent,
  totalPaid,
  onRowClick,
}) => {
  const totalOutstanding = totalSpent - totalPaid;

  return (
    <DataTable
      colsClass={ROW_COLS}
      columns={COLUMNS}
      isEmpty={expenses.length === 0}
      emptyMessage="No expenses match your search."
      footer={
        <DataTableTotalRow>
          <span className="text-xs">
            Total{" "}
            <span className="font-medium text-muted-foreground">
              · {expenses.length}{" "}
              {expenses.length === 1 ? "result" : "results"}
            </span>
          </span>
          <span className="hidden sm:block" />
          <span />
          <div className="text-right">
            <div className="font-display text-sm tabular-nums">
              {formatSGD(totalSpent)}
            </div>
            {totalOutstanding > 0 && (
              <div className="text-2xs font-medium leading-tight text-warning tabular-nums">
                {formatSGD(totalOutstanding)} left
              </div>
            )}
          </div>
        </DataTableTotalRow>
      }
    >
      {expenses.map((e) => (
        <ExpenseRow key={e.id} expense={e} onClick={onRowClick} />
      ))}
    </DataTable>
  );
};

export default ExpensesSheet;
