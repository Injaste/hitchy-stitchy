import type { FC } from "react";
import { Search, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { GuestStatus } from "../types";

type StatusFilter = GuestStatus | "all";

interface GuestsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  filteredCount: number;
  totalCount: number;
}

const STATUS_PILLS = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
] satisfies { value: StatusFilter; label: string }[];

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
              variant={statusFilter === pill.value ? "secondary" : "ghost"}
              onClick={() => onStatusFilterChange(pill.value)}
              className="px-3 h-8 rounded-lg text-xs font-medium transition-colors"
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Entry count — right-aligned, contextual */}
      <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
        <Users className="size-3.5" />
        {isFiltered ? (
          <>
            <span className="text-foreground font-medium">{filteredCount}</span>
            {" of "}
            {totalCount} {totalCount === 1 ? "entry" : "entries"}
          </>
        ) : (
          <>
            {totalCount} {totalCount === 1 ? "entry" : "entries"}
          </>
        )}
      </p>
    </div>
  );
};

export default GuestsFilters;
