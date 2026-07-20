import { useMemo, useState } from "react";
import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";
import NoResults from "@/components/custom/states/no-results";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { itemFadeUp } from "@/lib/animations";

import { useAccess } from "../../hooks/useAccess";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { dayLabel } from "../../days/utils";
import { useVendorModalStore } from "../hooks/useVendorModalStore";
import {
  useVendorDayFilter,
  useValidVendorDayFilter,
} from "../hooks/useVendorDayFilter";
import { categoryMeta, sortVendors } from "../utils";
import type { VendorsData } from "../api";

import VendorCard from "./VendorCard";
import VendorStats from "./VendorStats";
import VendorsSkeleton from "../states/VendorsSkeleton";
import VendorsEmpty from "../states/VendorsEmpty";

interface VendorsViewProps {
  data?: VendorsData;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const VendorsView: FC<VendorsViewProps> = ({
  data,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openCreate = useVendorModalStore((s) => s.openCreate);
  const openDetail = useVendorModalStore((s) => s.openDetail);
  const { canCreate } = useAccess();
  const { days, multiDay } = useActiveEventDay();

  const [search, setSearch] = useState("");
  // Day filter (null = all). Independent of the global active-day rail — a vendor
  // can span days, so this narrows the directory rather than scoping it. Lives in
  // a store because "Add expense" from a vendor reads it to guess the day.
  const dayFilter = useValidVendorDayFilter();
  const setDayFilter = useVendorDayFilter((s) => s.setDayId);

  const vendors = data?.vendors ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = vendors.filter((vendor) => {
      if (dayFilter && !vendor.day_ids.includes(dayFilter)) return false;
      if (!q) return true;
      return (
        vendor.name.toLowerCase().includes(q) ||
        categoryMeta(vendor.category).label.toLowerCase().includes(q) ||
        (vendor.phone ?? "").toLowerCase().includes(q) ||
        (vendor.email ?? "").toLowerCase().includes(q) ||
        (vendor.notes ?? "").toLowerCase().includes(q)
      );
    });
    return sortVendors(matched);
  }, [vendors, search, dayFilter]);

  // No results after search — blur-swap against the grid (mirrors MembersView).
  const renderContent = () => {
    if (filtered.length === 0) {
      return (
        <ComponentFade key="no-match" useBlur>
          <NoResults message="No vendors match your search." />
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="results" useBlur>
        <div className="@container">
          <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
            <AnimatePresence>
              {filtered.map((vendor, i) => (
                <motion.div
                  key={vendor.id}
                  custom={i}
                  variants={itemFadeUp}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  layout
                  transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
                  className="h-full"
                >
                  <VendorCard vendor={vendor} onOpen={openDetail} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </ComponentFade>
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <ComponentFade key="skeleton" useBlur>
          <VendorsSkeleton />
        </ComponentFade>
      );
    }

    if (isError || !data) {
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your vendors. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );
    }

    if (vendors.length === 0) {
      return (
        <ComponentFade key="empty" useBlur>
          <VendorsEmpty onAdd={openCreate} canCreate={canCreate("vendors")} />
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="content" useBlur>
        <div className="space-y-4">
          {/* Count rides the search row rather than a line of its own — it's a
              single stat, and it belongs next to the thing that changes it. */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearch("");
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Search by name, category or contact…"
                className="rounded-full pl-9"
              />
            </div>

            <VendorStats
              total={vendors.length}
              shown={filtered.length}
              isLoading={isLoading}
              isError={isError}
            />
          </div>

          {/* Day filter — only on multi-day events, where a vendor roster splits
              by day. "All days" clears it; tapping the active chip also clears. */}
          {multiDay && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant={dayFilter === null ? "default" : "outline"}
                onClick={() => setDayFilter(null)}
                className="rounded-full"
              >
                All days
              </Button>
              {days.map((day, index) => (
                <Button
                  key={day.id}
                  size="sm"
                  variant={dayFilter === day.id ? "default" : "outline"}
                  onClick={() =>
                    setDayFilter(dayFilter === day.id ? null : day.id)
                  }
                  className="rounded-full"
                >
                  {dayLabel(day.label, index)}
                </Button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {renderContent()}
          </AnimatePresence>
        </div>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default VendorsView;
