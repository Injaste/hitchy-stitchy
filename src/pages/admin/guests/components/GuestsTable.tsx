import { useCallback, useLayoutEffect, useRef, useState, type FC } from "react";
import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import type { Guest, GuestStatus } from "../types";

import { Checkbox } from "@/components/ui/checkbox";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";
import ScrollGradient from "@/components/custom/scroll-gradient";

import GuestsRow from "./GuestsRow";

interface GuestsTableProps {
  guests: Guest[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAllFiltered: () => void;
  allFilteredSelected: boolean;
  someFilteredSelected: boolean;
}

const COL_COUNT = 6;

const GuestsTable: FC<GuestsTableProps> = ({
  guests,
  selectedIds,
  onToggleRow,
  onToggleAllFiltered,
  allFilteredSelected,
  someFilteredSelected,
}) => {
  const openDetail = useGuestModalStore((s) => s.openDetail);
  const openEdit = useGuestModalStore((s) => s.openEdit);
  const openDelete = useGuestModalStore((s) => s.openDelete);
  const { canUpdate, canDelete } = useAccess();
  const { updateStatus } = useGuestMutations();

  // The mutation object is a fresh reference every render; route the row's
  // call through a stable callback so memo() on GuestsRow holds.
  const updateStatusRef = useRef(updateStatus);
  updateStatusRef.current = updateStatus;
  const handleUpdateStatus = useCallback(
    (guest: Guest, status: GuestStatus) =>
      updateStatusRef.current.mutate({ guest, status }),
    [],
  );

  const canEdit = canUpdate("guests");
  const canRemove = canDelete("guests");
  const hasCrudActions = canEdit || canRemove;

  const headerChecked: boolean | "indeterminate" = allFilteredSelected
    ? true
    : someFilteredSelected
      ? "indeterminate"
      : false;

  // The body scrolls under a pinned header, so the top fade has to start at the
  // header's bottom edge — measure it rather than hardcode the row height.
  const { scrollRef, canScrollUp, canScrollDown, onScroll } =
    useScrollVisibility();
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useLayoutEffect(() => {
    const el = theadRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Inset the fades by the scrollbar gutter so they don't tint it. The observer
  // re-fires when the gutter toggles (the content box width changes with it).
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setScrollbarWidth(el.offsetWidth - el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollRef]);

  return (
    <div className="relative rounded-lg border border-border overflow-hidden md:flex-1 md:min-h-0 md:flex md:flex-col">
      <ScrollGradient
        side="top"
        visible={canScrollUp}
        style={{ top: headerHeight, right: scrollbarWidth }}
      />
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="md:flex-1 md:min-h-0 md:overflow-y-auto md:[scrollbar-width:thin]"
      >
        <table className="w-full text-sm table-fixed relative">
        <colgroup>
          <col className="w-10" />
          <col className="min-w-40" />
          <col className="min-w-20 w-[10%]" />
          <col className="min-w-28 w-[16%]" />
          <col className="min-w-36 w-[20%] hidden sm:table-column" />
          <col className="min-w-20 w-[10%]" />
        </colgroup>

        <thead ref={theadRef} className="sticky top-0 bg-background z-10">
          <tr className="border-b border-border bg-muted/40">
            <th className="px-5 py-3 align-middle">
              <Checkbox
                checked={headerChecked}
                onCheckedChange={onToggleAllFiltered}
                disabled={guests.length === 0}
                aria-label="Select all guests"
              />
            </th>
            <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Guest
            </th>
            <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Party
            </th>
            <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground hidden sm:table-cell">
              Registered
            </th>
            <th className="text-right px-5 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td
                colSpan={COL_COUNT}
                className="px-5 py-12 text-center text-sm text-muted-foreground"
              >
                No guests match your search.
              </td>
            </tr>
          ) : (
            <>
              {guests.map((guest) => (
                <GuestsRow
                  key={guest.id}
                  guest={guest}
                  isSelected={selectedIds.has(guest.id)}
                  onToggle={onToggleRow}
                  openDetail={openDetail}
                  openEdit={openEdit}
                  openDelete={openDelete}
                  canEdit={canEdit}
                  canRemove={canRemove}
                  hasCrudActions={hasCrudActions}
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={updateStatus.isPending}
                />
              ))}
            </>
          )}
        </tbody>
        </table>
      </div>
      <ScrollGradient
        side="bottom"
        visible={canScrollDown}
        style={{ right: scrollbarWidth }}
      />
    </div>
  );
};

export default GuestsTable;
