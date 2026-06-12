import { useMemo, useState } from "react"
import type { FC } from "react"
import { AnimatePresence } from "framer-motion"

import ComponentFade from "@/components/animations/animate-component-fade"
import ErrorState from "@/components/custom/states/error-state"
import DayTabs from "@/pages/admin/components/DayTabs"
import { dayLabel } from "@/pages/admin/days/utils"

import { useAccess } from "../../hooks/useAccess"
import { useActiveEventDay } from "../../hooks/useActiveEventDay"
import { useExpenseModalStore } from "../hooks/useExpenseModalStore"
import {
  computeSummary,
  dayBudgetTotal,
  dueInfo,
  expensesForDay,
  grandBudget,
  sortExpenses,
  statusOf,
} from "../utils"
import type { BudgetData } from "../api"
import type { ExpenseFilter } from "../types"

import BudgetOverview from "./BudgetOverview"
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

  const { days, activeDayId, activeDay, activeIndex, multiDay } =
    useActiveEventDay()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<ExpenseFilter>("all")

  const buckets = data?.buckets ?? []
  const expenses = data?.expenses ?? []

  // Whole wedding: every expense against the summed per-day caps.
  const globalSummary = useMemo(
    () => computeSummary(expenses, grandBudget(buckets)),
    [expenses, buckets],
  )

  // The selected day: its own cap + only its expenses.
  const dayExpenses = useMemo(
    () => expensesForDay(expenses, buckets, activeDayId),
    [expenses, buckets, activeDayId],
  )
  const daySummary = useMemo(
    () => computeSummary(dayExpenses, dayBudgetTotal(buckets, activeDayId)),
    [dayExpenses, buckets, activeDayId],
  )
  const scopeLabel = multiDay ? dayLabel(activeDay?.label, activeIndex) : undefined

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matched = dayExpenses.filter((e) => {
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
  }, [dayExpenses, search, filter])

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

    const visibleSpent = filtered.reduce((s, e) => s + e.amount, 0)
    const visiblePaid = filtered.reduce((s, e) => s + e.paid, 0)

    // The hero stays mounted in every loaded state so the day's budget is
    // editable inline even before any expense exists for it.
    return (
      <ComponentFade key="content" useBlur>
        <div className="space-y-4">
          {/* Whole-wedding roll-up — only meaningful once there's >1 day; on a
              single-day event the day hero below already is the whole picture. */}
          {multiDay && (
            <BudgetOverview summary={globalSummary} dayCount={days.length} />
          )}

          <DayTabs />

          {/* Switching days blur-swaps the day's hero + sheet (mirrors the
              timeline); the overview + day rail above stay put. */}
          <AnimatePresence mode="wait">
            <ComponentFade key={activeDayId ?? "none"} useBlur>
              <div className="space-y-4">
                <BudgetSummary summary={daySummary} scopeLabel={scopeLabel} />

                {/* The empty state ↔ filters+sheet also blur-swap within a day
                    (the hero above stays put). initial={false} so this doesn't
                    re-fire on a day switch — the outer fade already covers that. */}
                <AnimatePresence mode="wait" initial={false}>
                  {dayExpenses.length === 0 ? (
                    <ComponentFade key="empty" useBlur>
                      <BudgetEmpty
                        onAdd={openCreate}
                        canCreate={canCreate("budget")}
                        scoped={multiDay}
                      />
                    </ComponentFade>
                  ) : (
                    <ComponentFade key="rows" useBlur>
                      <div className="space-y-4">
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
                  )}
                </AnimatePresence>
              </div>
            </ComponentFade>
          </AnimatePresence>
        </div>
      </ComponentFade>
    )
  }

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
}

export default BudgetView
