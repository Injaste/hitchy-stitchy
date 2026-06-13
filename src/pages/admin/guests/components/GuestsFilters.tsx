import type { FC, ReactNode } from "react";
import { Search, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { GuestStatus } from "../types";

type StatusFilter = GuestStatus | "all";

interface GuestsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  /** Right-aligned toolbar slot (e.g. export). */
  trailing?: ReactNode;
}

import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const STATUS_PILLS = [
  { value: "all", label: "All", variant: "secondary" },
  { value: "confirmed", label: "Confirmed", variant: "success" },
  { value: "pending", label: "Pending", variant: "warning" },
  { value: "cancelled", label: "Cancelled", variant: "destructive" },
] satisfies {
  value: StatusFilter;
  label: string;
  variant: VariantProps<typeof buttonVariants>["variant"];
}[];

const STATUS_PILLS_HOVER_CLASS = {
  secondary: "hover:text-secondary-foreground",
  success: "hover:text-success",
  warning: "hover:text-warning",
  destructive: "hover:text-destructive",
};

const GuestsFilters: FC<GuestsFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  trailing,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or phone…"
          className="pl-8 h-8 text-sm"
          aria-label="Search guests"
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Clear search"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => onSearchChange("")}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Status pills */}
        <div
          role="group"
          aria-label="Filter by status"
          className="flex items-center gap-1.5"
        >
          {STATUS_PILLS.map((pill) => (
            <Button
              key={pill.value}
              type="button"
              size="sm"
              variant={pill.variant}
              onClick={() => onStatusFilterChange(pill.value)}
              className={cn(
                "text-xs",
                statusFilter !== pill.value &&
                  `bg-transparent text-muted-foreground ${STATUS_PILLS_HOVER_CLASS[pill.variant]}`,
              )}
            >
              {pill.label}
            </Button>
          ))}
        </div>

        {trailing && <div className="ml-auto">{trailing}</div>}
      </div>
    </div>
  );
};

export default GuestsFilters;
