import type { FC } from "react"
import { Plus, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import EmptyState from "@/components/custom/states/empty-state"

interface BudgetEmptyProps {
  onAdd: () => void
  canCreate: boolean
}

const BudgetEmpty: FC<BudgetEmptyProps> = ({ onAdd, canCreate }) => (
  <EmptyState
    icon={
      <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-primary/20 bg-primary/10">
        <Wallet className="size-7 text-primary" />
      </div>
    }
    title="No expenses yet"
    description="Add an expense to see what it costs, what's paid, and what's still owed — all in SGD."
    action={
      canCreate ? (
        <Button onClick={onAdd} className="gap-1">
          <Plus className="size-4" />
          Add first expense
        </Button>
      ) : undefined
    }
  />
)

export default BudgetEmpty
