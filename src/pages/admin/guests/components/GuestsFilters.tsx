import type { FC } from "react";
import { Search, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { GuestStatus } from "../types";
import Odometer from "@/components/animations/animate-odometer";

type StatusFilter = GuestStatus | "all";

interface GuestsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  filteredCount: number;
  totalCount: number;
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
  filteredCount,
  totalCount,
}) => {
  const isFiltered = search || statusFilter !== "all";

  return (
    <div className="flex flex-col gap-2 mb-5">
      <div className="flex flex-col sm:flex-row gap-3">
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
      </div>

      {/* Entry count — right-aligned, contextual */}
      <div className="flex items-center justify-end text-xs text-muted-foreground">
        <Users className="size-3.5 mr-1" />
        <AnimatePresence>
          {isFiltered && (
            <motion.div
              key="filtered-count"
              className="flex gap-1 items-center"
              initial={{ opacity: 0, width: 0, overflow: "hidden" }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0, overflow: "hidden" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="text-foreground font-medium">
                <Odometer value={filteredCount} />
              </div>
              <div>of</div>
              <div> </div>
            </motion.div>
          )}
          <Odometer value={totalCount} />
        </AnimatePresence>
        <span className="ml-1">{totalCount === 1 ? "result" : "results"}</span>
      </div>
    </div>
  );
};

export default GuestsFilters;
