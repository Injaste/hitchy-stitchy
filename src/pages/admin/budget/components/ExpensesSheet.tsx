import type { FC } from "react"
import { AnimatePresence, motion } from "framer-motion"

import ComponentFade from "@/components/animations/animate-component-fade"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

import ExpenseRow, { ROW_COLS } from "./ExpenseRow"
import { formatSGD } from "../utils"
import type { Expense } from "../types"

const GRID = `grid ${ROW_COLS} gap-x-2`

interface ExpensesSheetProps {
  expenses: Expense[]
  totalSpent: number
  totalPaid: number
  onRowClick: (expense: Expense) => void
}

const ExpensesSheet: FC<ExpensesSheetProps> = ({
  expenses,
  totalSpent,
  totalPaid,
  onRowClick,
}) => {
  const totalOutstanding = totalSpent - totalPaid
  const isEmpty = expenses.length === 0

  return (
    <Card className="gap-0 py-0">
      <div
        className={cn(
          GRID,
          "border-b border-border bg-muted py-2.5 pr-3 pl-4 text-2xs font-semibold uppercase tracking-wide text-muted-foreground",
        )}
      >
        <span>Item</span>
        <span className="hidden sm:block">Paid by</span>
        <span>Due</span>
        <span className="text-right">Amount</span>
      </div>

      {/* Empty result lives inside the sheet so the header frame stays put
          (mirrors GuestsTable). Only the body blur-swaps; the total footer is
          dropped on empty — nothing to total. */}
      <AnimatePresence mode="wait" initial={false}>
        {isEmpty ? (
          <ComponentFade key="empty" useBlur>
            {/* min-h matches one row (~54px) + the total footer (~46px) so the
                Card height holds steady between a single result and no match. */}
            <div className="flex min-h-25 items-center justify-center text-center text-sm text-muted-foreground">
              No expenses match your search.
            </div>
          </ComponentFade>
        ) : (
          <ComponentFade key="rows" useBlur>
            <AnimatePresence initial={false}>
              {expenses.map((e) => (
                <ExpenseRow key={e.id} expense={e} onClick={onRowClick} />
              ))}
            </AnimatePresence>

            <motion.div
              layout
              className={cn(
                GRID,
                "items-center border-t-2 border-foreground/80 bg-muted py-3 pr-3 pl-4 font-bold",
              )}
            >
              <span className="text-xs">
                Total{" "}
                <span className="font-medium text-muted-foreground">
                  · {expenses.length} {expenses.length === 1 ? "item" : "items"}
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
            </motion.div>
          </ComponentFade>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default ExpensesSheet
