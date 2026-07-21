import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";
import NoResults from "@/components/custom/states/no-results";
import { Input } from "@/components/ui/input";
import DayTabs from "@/pages/admin/components/DayTabs";
import { itemFadeUp } from "@/lib/animations";

import { useAccess } from "../../hooks/useAccess";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { useVendorModalStore } from "../hooks/useVendorModalStore";
import { useVendorDayScope } from "../hooks/useVendorDayFilter";
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
  // No multiDay guard needed — DayTabs hides itself on single-day events.
  const { days, activeDayId, setActiveDay } = useActiveEventDay();

  const [search, setSearch] = useState("");
  // The day tiles drive the SHARED global day (so a pick persists to Budget /
  // Timeline); "All days" is a local override that shows the whole roster without
  // touching the global day. Effective filter: the active day, or null under All.
  const showAll = useVendorDayScope((s) => s.showAll);
  const setShowAll = useVendorDayScope((s) => s.setShowAll);
  const dayFilter = showAll ? null : activeDayId;

  // "All days" is a per-visit override — clear it on leave so the next visit
  // opens on the active day (the default) rather than a stale "All".
  useEffect(() => () => setShowAll(false), [setShowAll]);

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
          {/* Count sits beside the search on desktop — a single stat next to the
              thing that changes it. On mobile there's no room for both on one
              line, so it stacks above (col-reverse), mirroring the guests view. */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
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

          {/* The shared day rail. Day tiles write the GLOBAL day (so the pick
              persists across routes); "All days" is a local override for the
              whole roster — the only place a 0-day vendor (e.g. flowers) shows —
              and leaves the global day untouched. */}
          <DayTabs
            days={days}
            activeDayId={dayFilter}
            onSelect={(id) => {
              setActiveDay(id);
              setShowAll(false);
            }}
            includeAll
            onSelectAll={() => setShowAll(true)}
          />

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
