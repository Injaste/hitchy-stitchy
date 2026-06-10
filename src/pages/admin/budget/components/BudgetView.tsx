import { useMemo, useState } from "react"
import type { FC } from "react"
import { AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"

import ComponentFade from "@/components/animations/animate-component-fade"
import ErrorState from "@/components/custom/states/error-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { useAccess } from "../../hooks/useAccess"
import { useExpenseModalStore } from "../hooks/useExpenseModalStore"
import { computeSummary, dueInfo, sortExpenses, statusOf } from "../utils"
import type { BudgetData } from "../api"

import BudgetSummary from "./BudgetSummary"
import ExpensesSheet from "./ExpensesSheet"
import BudgetSkeleton from "../states/BudgetSkeleton"
import BudgetEmpty from "../states/BudgetEmpty"

const FILTER_PILLS = [
  { value: "all", label: "All", variant: "secondary" },
  { value: "outstanding", label: "Outstanding", variant: "warning" },
  { value: "overdue", label: "Overdue", variant: "destructive" },
  { value: "paid", label: "Paid", variant: "success" },
] as const

type ExpenseFilter = (typeof FILTER_PILLS)[number]["value"]

const FILTER_HOVER: Record<string, string> = {
  secondary: "hover:text-secondary-foreground",
  warning: "hover:text-warning",
  destructive: "hover:text-destructive",
  success: "hover:text-success",
}

interface BudgetViewProps {
  data?: BudgetData
  isLoading: boolean
  isError: boolean
  isRefetching: boolean
  refetch: () => void
}

const BudgetView: FC<BudgetViewProps> = ({
  data,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openCreate = useExpenseModalStore((s) => s.openCreate)
  const openEditItem = useExpenseModalStore((s) => s.openEditItem)
  const { canCreate } = useAccess()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<ExpenseFilter>("all")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matched = (data?.expenses ?? []).filter((e) => {
      const matchesSearch =
        !q ||
        e.item.toLowerCase().includes(q) ||
        (e.vendor_name ?? "").toLowerCase().includes(q) ||
        (e.payer ?? "").toLowerCase().includes(q)
      if (!matchesSearch) return false

      if (filter === "paid") return statusOf(e) === "paid"
      if (filter === "outstanding") return statusOf(e) !== "paid"
      if (filter === "overdue") return dueInfo(e).urgency === "overdue"
      return true
    })
    return sortExpenses(matched)
  }, [data, search, filter])

  const summary = useMemo(
    () => computeSummary(data?.expenses ?? [], data?.budgetTotal ?? null),
    [data],
  )

  const renderBody = () => {
    if (isLoading) {
      return (
        <ComponentFade key="skeleton">
          <BudgetSkeleton />
        </ComponentFade>
      )
    }

    if (isError || !data) {
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your budget. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      )
    }

    const hasExpenses = data.expenses.length > 0
    const visibleSpent = filtered.reduce((s, e) => s + e.amount, 0)
    const visiblePaid = filtered.reduce((s, e) => s + e.paid, 0)

    return (
      <ComponentFade key="content">
        <div className="space-y-4">
          {/* Hero is always shown when loaded, so the budget stays editable
              inline even before any expenses exist. */}
          <BudgetSummary summary={summary} />

          <AnimatePresence mode="wait" initial={false}>
            {hasExpenses ? (
              <ComponentFade key="sheet">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search item, vendor or payer…"
                        className="rounded-full pl-9"
                      />
                    </div>

                    <div
                      role="group"
                      aria-label="Filter expenses"
                      className="flex flex-wrap items-center gap-1.5"
                    >
                      {FILTER_PILLS.map((pill) => (
                        <Button
                          key={pill.value}
                          type="button"
                          size="sm"
                          variant={pill.variant}
                          onClick={() => setFilter(pill.value)}
                          className={cn(
                            "text-xs",
                            filter !== pill.value &&
                              `bg-transparent text-muted-foreground ${FILTER_HOVER[pill.variant]}`,
                          )}
                        >
                          {pill.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {filtered.length > 0 ? (
                    <ExpensesSheet
                      expenses={filtered}
                      totalSpent={visibleSpent}
                      totalPaid={visiblePaid}
                      onRowClick={openEditItem}
                    />
                  ) : (
                    <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
                      No expenses match your search.
                    </div>
                  )}
                </div>
              </ComponentFade>
            ) : (
              <ComponentFade key="empty">
                <BudgetEmpty onAdd={openCreate} canCreate={canCreate("budget")} />
              </ComponentFade>
            )}
          </AnimatePresence>
        </div>
      </ComponentFade>
    )
  }

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
}

export default BudgetView
