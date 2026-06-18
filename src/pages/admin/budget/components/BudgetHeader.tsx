import type { FC } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/custom/admin-page-header"
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base"

import { useAccess } from "../../hooks/useAccess"
import { useActiveEventDay } from "../../hooks/useActiveEventDay"
import { dayLabel } from "../../days/utils"
import { useExpenseModalStore } from "../hooks/useExpenseModalStore"
import type { BudgetData } from "../api"

interface BudgetHeaderProps extends BaseHeaderProps {
  data?: BudgetData
}

const BudgetHeader: FC<BudgetHeaderProps> = ({
  data,
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { canCreate } = useAccess()
  const openCreate = useExpenseModalStore((s) => s.openCreate)
  const canAdd = canCreate("budget")

  // Mirror the active-day scope in the header (label only) when the event spans
  // multiple days — matches the timeline header treatment.
  const { activeDay, activeIndex, multiDay } = useActiveEventDay()
  const daySuffix = multiDay ? dayLabel(activeDay?.label, activeIndex) : null

  return (
    <AdminPageHeader
      containerSize="md"
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Budget"
      titleSuffix={
        daySuffix && (
          <div className="flex min-w-0 items-center text-sm font-medium text-muted-foreground sm:text-base">
            <span className="min-w-0 truncate">{daySuffix}</span>
          </div>
        )
      }
      description="Keep an eye on what things cost, what's paid, and what's left to pay."
      action={
        canAdd && (
          <Button
            size="sm"
            variant="default"
            onClick={openCreate}
            className="gap-0"
          >
            <Plus className="w-4 h-4" /> <ActionLabel>Expense</ActionLabel>
          </Button>
        )
      }
    />
  )
}

export default BudgetHeader
