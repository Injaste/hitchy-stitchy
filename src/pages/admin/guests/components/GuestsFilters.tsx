import type { FC } from "react";
import {
  Search,
  X,
  CheckCircle,
  Clock,
  XCircle,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

import { type VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterToolbar from "@/components/custom/filter-toolbar";
import { cn } from "@/lib/utils";

import type { GuestStatus } from "../types";

type StatusFilter = GuestStatus | "all";

interface GuestsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}

const STATUS_PILLS = [
  { value: "all", label: "All", variant: "secondary", icon: ClipboardList },
  { value: "confirmed", label: "Confirmed", variant: "success", icon: CheckCircle },
  { value: "pending", label: "Pending", variant: "warning", icon: Clock },
  { value: "cancelled", label: "Cancelled", variant: "destructive", icon: XCircle },
] satisfies {
  value: StatusFilter;
  label: string;
  variant: VariantProps<typeof buttonVariants>["variant"];
  icon: LucideIcon;
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
}) => {
  return (
    <FilterToolbar
      filter={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { onSearchChange(""); e.currentTarget.blur(); } }}
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
      }
      actions={
        <div
          role="group"
          aria-label="Filter by status"
          className="flex items-center gap-1.5"
        >
          {STATUS_PILLS.map((pill) => {
            const Icon = pill.icon;
            return (
              <Button
                key={pill.value}
                type="button"
                size="sm"
                variant={pill.variant}
                onClick={() => onStatusFilterChange(pill.value)}
                aria-label={pill.label}
                className={cn(
                  "text-xs",
                  statusFilter !== pill.value &&
                    `bg-transparent text-muted-foreground ${STATUS_PILLS_HOVER_CLASS[pill.variant]}`,
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{pill.label}</span>
              </Button>
            );
          })}
        </div>
      }
    />
  );
};

export default GuestsFilters;
