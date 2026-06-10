import { useMemo, useState } from "react"
import type { FC } from "react"
import { AnimatePresence } from "framer-motion"

import ComponentFade from "@/components/animations/animate-component-fade"
import ErrorState from "@/components/custom/states/error-state"

import { useAccess } from "../../hooks/useAccess"
import { useExpenseModalStore } from "../hooks/useExpenseModalStore"
import { computeSummary, dueInfo, sortExpenses, statusOf } from "../utils"
import type { BudgetData } from "../api"
import type { ExpenseFilter } from "../types"

import BudgetSummary from "./BudgetSummary"
import ExpenseFilters from "./ExpenseFilters"
import ExpensesSheet from "./ExpensesSheet"
import BudgetSkeleton from "../states/BudgetSkeleton"
import BudgetEmpty from "../states/BudgetEmpty"

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
        <ComponentFade key="skeleton" useBlur>
          <BudgetSkeleton />
        </ComponentFade>
      )
    }

    if (isError || !data) {
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your budget. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      )
    }

    // The hero stays mounted in every loaded state so the budget total is
    // editable inline even before any expense exists.
    if (data.expenses.length === 0) {
      return (
        <ComponentFade key="empty" useBlur>
          <div className="space-y-4">
            <BudgetSummary summary={summary} />
            <BudgetEmpty onAdd={openCreate} canCreate={canCreate("budget")} />
          </div>
        </ComponentFade>
      )
    }

    const visibleSpent = filtered.reduce((s, e) => s + e.amount, 0)
    const visiblePaid = filtered.reduce((s, e) => s + e.paid, 0)

    return (
      <ComponentFade key="content" useBlur>
        <div className="space-y-4">
          <BudgetSummary summary={summary} />
          <ExpenseFilters
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
          />
          <ExpensesSheet
            expenses={filtered}
            totalSpent={visibleSpent}
            totalPaid={visiblePaid}
            onRowClick={openEditItem}
          />
        </div>
      </ComponentFade>
    )
  }

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
}

export default BudgetView
