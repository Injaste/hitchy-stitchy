import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { AnimatePresence } from "framer-motion";
import { MailPlus } from "lucide-react";

import ComponentFade from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/states/error-state";
import EmptyState from "@/components/custom/states/empty-state";

import { useAccess } from "../../hooks/useAccess";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import {
  useInvitationsQuery,
  useEventSegmentsQuery,
} from "../../invitation/queries";
import DayTabs from "../../components/DayTabs";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import type { Guest, GuestStatus } from "../types";

import GuestsSkeleton from "../states/GuestsSkeleton";
import GuestsEmpty from "../states/GuestsEmpty";
import GuestsStats from "./GuestsStats";
import GuestsTable from "./GuestsTable";
import GuestsFilters from "./GuestsFilters";
import GuestsBulkBar from "./GuestsBulkBar";
import GuestsExport from "./GuestsExport";
import SegmentTabs, { type SegmentTabsOption } from "./SegmentTabs";
import { useGuestMutations } from "../queries";
import { pageLabel } from "../../invitation/utils";
import CopyLinksMenu from "../../invitation/components/CopyLinksMenu";
import FilterToolbar from "@/components/custom/filter-toolbar";
import { useAdminStore } from "../../store/useAdminStore";
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
  const openBulkUpdate = useGuestModalStore((s) => s.openBulkUpdate);
  const selectedIds = useGuestModalStore((s) => s.selectedIds);
  const toggleRow = useGuestModalStore((s) => s.toggleRow);
  const setSelectedIds = useGuestModalStore((s) => s.setSelectedIds);
  const clearSelection = useGuestModalStore((s) => s.clearSelection);
  const activeInvitationId = useGuestModalStore((s) => s.activeInvitationId);
  const setActiveInvitationId = useGuestModalStore(
    (s) => s.setActiveInvitationId,
  );
  const { canCreate, canUpdate } = useAccess();
  const { bulkUpdateGuests } = useGuestMutations();
  const { slug } = useAdminStore();

  const { days, activeDayId, setActiveDay } = useActiveEventDay();
  const { data: invitations } = useInvitationsQuery();
  const { data: segments } = useEventSegmentsQuery();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const canBulkUpdate = canUpdate("guests");

  // Guests drive their own day rail: only days that actually have an invitation
  // page appear (like gifts). The global active day is the source of truth, but
  // if it has no page we *display* the first invitation-day without touching it.
  const invitationDays = useMemo(() => {
    const withPage = new Set((invitations ?? []).map((i) => i.day_id));
    return days.filter((d) => withPage.has(d.id));
  }, [days, invitations]);

  const effectiveDayId = invitationDays.some((d) => d.id === activeDayId)
    ? activeDayId
    : (invitationDays[0]?.id ?? null);

  // The effective day's pages — day-level (no segment) first, then by creation
  // order — so the segment filter and create target read predictably.
  const dayPages = useMemo(() => {
    const list = (invitations ?? []).filter((i) => i.day_id === effectiveDayId);
    return [...list].sort((a, b) => {
      const rank = (s: string | null) => (s === null ? 0 : 1);
      const byRoot = rank(a.segment_id) - rank(b.segment_id);
      return byRoot !== 0 ? byRoot : a.created_at.localeCompare(b.created_at);
    });
  }, [invitations, effectiveDayId]);

  // The focused page must belong to the active day; otherwise treat it as "All".
  // The effect then clears a stale selection left over from the previous day.
  const effectivePageId =
    activeInvitationId && dayPages.some((p) => p.id === activeInvitationId)
      ? activeInvitationId
      : null;
  useEffect(() => {
    if (activeInvitationId && activeInvitationId !== effectivePageId) {
      setActiveInvitationId(null);
    }
  }, [activeInvitationId, effectivePageId, setActiveInvitationId]);

  const dayPageIds = useMemo(
    () => new Set(dayPages.map((p) => p.id)),
    [dayPages],
  );
  const dayGuests = useMemo(
    () =>
      (data ?? []).filter(
        (g) => g.invitation_id && dayPageIds.has(g.invitation_id),
      ),
    [data, dayPageIds],
  );
  const scopedGuests = useMemo(
    () =>
      effectivePageId
        ? dayGuests.filter((g) => g.invitation_id === effectivePageId)
        : dayGuests,
    [dayGuests, effectivePageId],
  );

  const segmentOptions: SegmentTabsOption[] = useMemo(() => {
    if (dayPages.length <= 1) return [];
    return [
      { id: null, label: "All", count: dayGuests.length },
      ...dayPages.map((p) => ({
        id: p.id,
        label: pageLabel(p, days, segments ?? []),
        count: dayGuests.filter((g) => g.invitation_id === p.id).length,
        mode: p.rsvp_mode,
      })),
    ];
  }, [dayPages, dayGuests, days, segments]);

  // Show the RSVP deadline only when a single page is in view (a focused
  // segment, or a day with one page) — a multi-page "All" has no single date.
  const focusPage = effectivePageId
    ? dayPages.find((p) => p.id === effectivePageId)
    : dayPages.length === 1
      ? dayPages[0]
      : undefined;

  // Copyable links for the page(s) in scope: a focused segment → just that page;
  // "All" → every page of the day. Only published pages have a live URL.
  const linkPages = useMemo(() => {
    const inScope = effectivePageId
      ? dayPages.filter((p) => p.id === effectivePageId)
      : dayPages;
    return inScope
      .filter((p) => p.published_at)
      .map((p) => ({
        label: pageLabel(p, days, segments ?? []),
        linkSlug: p.link_slug,
        mode: p.rsvp_mode,
        code: p.private_code,
      }));
  }, [dayPages, effectivePageId, days, segments]);

  const filtered = useMemo(
    () =>
      scopedGuests.filter((g) => {
        const matchesStatus =
          statusFilter === "all" || g.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          g.name.toLowerCase().includes(q) ||
          (g.phone?.includes(q) ?? false);
        return matchesStatus && matchesSearch;
      }),
    [scopedGuests, search, statusFilter],
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

    // Guests attach to an invitation page, so the list can't exist before one.
    if (!invitations?.length) {
      return (
        <ComponentFade key="no-invitation" useBlur>
          <EmptyState
            icon={
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-primary/20 bg-primary/10">
                <MailPlus className="h-7 w-7 text-primary" />
              </div>
            }
            title="Create an invitation first"
            description="Guests are tied to an invitation page. Add one from the Invitation tab, then come back to start your guest list."
          />
        </ComponentFade>
      );
    }

    if (!data?.length) {
      return (
        <ComponentFade key="empty" useBlur>
          <GuestsEmpty onAdd={openCreate} canCreate={canCreate("guests")} />
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="content" useBlur>
        <DayTabs
          days={invitationDays}
          activeDayId={effectiveDayId}
          onSelect={setActiveDay}
        />
        <FilterToolbar
          filter={
            segmentOptions.length > 0 ? (
              <SegmentTabs
                options={segmentOptions}
                activeId={effectivePageId}
                onSelect={setActiveInvitationId}
              />
            ) : null
          }
          actions={
            <>
              <GuestsExport guests={filtered} allGuests={selectedRows} />
              {slug && linkPages.length > 0 && (
                <CopyLinksMenu slug={slug} pages={linkPages} />
              )}
            </>
          }
        />
        <AnimatePresence mode="wait">
          {focusPage?.rsvp_deadline && (
            <DeadlineAlert
              key={focusPage.id}
              deadline={focusPage.rsvp_deadline}
            />
          )}
        </AnimatePresence>
        <GuestsStats guests={scopedGuests} />
        <GuestsFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
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
          statusFilter={statusFilter}
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
