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

  const renderSheet = () => {
    if (expenses.length === 0) {
      return (
        <ComponentFade key="no-match" useBlur>
          <Card className="py-12 text-center text-sm text-muted-foreground">
            No expenses match your search.
          </Card>
        </ComponentFade>
      )
    }

    return (
      <ComponentFade key="sheet" useBlur>
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
        </Card>
      </ComponentFade>
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {renderSheet()}
    </AnimatePresence>
  )
}

export default ExpensesSheet
