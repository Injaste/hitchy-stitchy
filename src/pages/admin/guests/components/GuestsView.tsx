import { useMemo, useState } from "react";
import type { FC } from "react";
import { AnimatePresence } from "framer-motion";

import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";

import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import type { Guest, GuestStatus } from "../types";

import GuestsSkeleton from "../states/GuestsSkeleton";
import GuestsEmpty from "../states/GuestsEmpty";
import GuestsStats from "./GuestsStats";
import GuestsTable from "./GuestsTable";
import GuestsFilters from "./GuestsFilters";
import GuestsBulkBar from "./GuestsBulkBar";
import GuestsExport from "./GuestsExport";
import { useGuestMutations } from "../queries";
import DeadlineAlert from "./DeadlineAlert";

type StatusFilter = GuestStatus | "all";

interface GuestsViewProps {
  data: Guest[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const GuestsView: FC<GuestsViewProps> = ({
  data,
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const openCreate = useGuestModalStore((s) => s.openCreate);
  const openImport = useGuestModalStore((s) => s.openImport);
  const openBulkUpdate = useGuestModalStore((s) => s.openBulkUpdate);
  const selectedIds = useGuestModalStore((s) => s.selectedIds);
  const toggleRow = useGuestModalStore((s) => s.toggleRow);
  const setSelectedIds = useGuestModalStore((s) => s.setSelectedIds);
  const clearSelection = useGuestModalStore((s) => s.clearSelection);
  const { canCreate, canUpdate } = useAccess();
  const { bulkUpdateGuests } = useGuestMutations();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const canBulkUpdate = canUpdate("guests");

  const filtered = useMemo(
    () =>
      (data ?? []).filter((g) => {
        const matchesStatus =
          statusFilter === "all" || g.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch =
          !q || g.name.toLowerCase().includes(q) || (g.phone?.includes(q) ?? false);
        return matchesStatus && matchesSearch;
      }),
    [data, search, statusFilter],
  );

  const selectedRows = useMemo(
    () => (data ?? []).filter((g) => selectedIds.has(g.id)),
    [data, selectedIds],
  );

  const filteredIds = useMemo(() => filtered.map((g) => g.id), [filtered]);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someFilteredSelected =
    !allFilteredSelected && filteredIds.some((id) => selectedIds.has(id));

  const toggleAllFiltered = () => {
    const next = new Set(selectedIds);
    if (allFilteredSelected) filteredIds.forEach((id) => next.delete(id));
    else filteredIds.forEach((id) => next.add(id));
    setSelectedIds(next);
  };

  const handleBulkRequest = (status: GuestStatus) => {
    openBulkUpdate(Array.from(selectedIds), status);
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <ComponentFade key="skeleton" useBlur>
          <GuestsSkeleton />
        </ComponentFade>
      );
    }

    if (isError) {
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your guest list. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );
    }

    if (!data?.length) {
      return (
        <ComponentFade key="empty" useBlur>
          <GuestsEmpty
            onAdd={openCreate}
            onImport={openImport}
            canCreate={canCreate("guests")}
          />
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="content" useBlur>
        <DeadlineAlert />
        <GuestsStats guests={data} />
        <GuestsFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          trailing={<GuestsExport guests={filtered} allGuests={selectedRows} />}
        />
        <AnimatePresence initial={false}>
          {canBulkUpdate && selectedIds.size > 0 && (
            <GuestsBulkBar
              key="bulk-bar"
              count={selectedIds.size}
              onClear={clearSelection}
              onRequest={handleBulkRequest}
              isPending={bulkUpdateGuests.isPending}
            />
          )}
        </AnimatePresence>
        <GuestsTable
          guests={filtered}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAllFiltered={toggleAllFiltered}
          allFilteredSelected={allFilteredSelected}
          someFilteredSelected={someFilteredSelected}
        />
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default GuestsView;
