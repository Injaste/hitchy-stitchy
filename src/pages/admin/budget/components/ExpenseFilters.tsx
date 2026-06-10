import type { FC } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { FILTER_PILLS, type ExpenseFilter } from "../types"

const FILTER_HOVER: Record<string, string> = {
  secondary: "hover:text-secondary-foreground",
  warning: "hover:text-warning",
  destructive: "hover:text-destructive",
  success: "hover:text-success",
}

interface ExpenseFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filter: ExpenseFilter
  onFilterChange: (filter: ExpenseFilter) => void
}

const ExpenseFilters: FC<ExpenseFiltersProps> = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="relative flex-1">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
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
          onClick={() => onFilterChange(pill.value)}
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
)

export default ExpenseFilters
