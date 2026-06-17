import type { FC } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/custom/admin-page-header"
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base"

import { useAccess } from "../../hooks/useAccess"
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

  return (
    <AdminPageHeader
      containerSize="md"
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Budget"
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
