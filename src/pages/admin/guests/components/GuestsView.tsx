import { useState } from "react";
import type { FC } from "react";
import { AnimatePresence } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";

import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import type { Guest, GuestStatus } from "../types";

import GuestsSkeleton from "../states/GuestsSkeleton";
import GuestsEmpty from "../states/GuestsEmpty";
import GuestsStats from "./GuestsStats";
import GuestsTable from "./GuestsTable";
import GuestsFilters from "./GuestsFilters";
import { Table } from "lucide-react";

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
  const { canCreate } = useAccess();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = (data ?? []).filter((g) => {
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || g.name.toLowerCase().includes(q) || g.phone.includes(q);
    return matchesStatus && matchesSearch;
  });

  const renderBody = () => {
    if (isLoading) {
      return (
        <ComponentFade key="skeleton">
          <GuestsSkeleton />
        </ComponentFade>
      );
    }

    if (isError) {
      return (
        <ComponentFade key="error">
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
        <ComponentFade key="empty">
          <GuestsEmpty
            onAdd={openCreate}
            onImport={openImport}
            canCreate={canCreate("rsvp")}
          />
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="content">
        <GuestsStats guests={data} />
        <GuestsFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          filteredCount={filtered.length}
          totalCount={data.length}
        />
        <GuestsTable guests={filtered} />
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default GuestsView;
