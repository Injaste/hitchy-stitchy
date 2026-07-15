import { useCallback, useRef, type FC } from "react";
import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import type { Guest, GuestStatus } from "../types";

import { Checkbox } from "@/components/ui/checkbox";
import DataTable, {
  type DataTableColumn,
} from "@/components/custom/tables/data-table";
import DataTableTotalRow from "@/components/custom/tables/data-table-total-row";

import GuestsRow, { ROW_COLS } from "./GuestsRow";
import { RSVP_MODE_META } from "../../invitation/rsvpMeta";
import type { RSVPMode } from "../../invitation/types";

interface GuestsTableProps {
  guests: Guest[];
  /** Selected status filter — drives the footer headline count + label. */
  statusFilter: GuestStatus | "all";
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAllFiltered: () => void;
  allFilteredSelected: boolean;
  someFilteredSelected: boolean;
}

const GuestsTable: FC<GuestsTableProps> = ({
  guests,
  statusFilter,
  selectedIds,
  onToggleRow,
  onToggleAllFiltered,
  allFilteredSelected,
  someFilteredSelected,
}) => {
  const openDetail = useGuestModalStore((s) => s.openDetail);
  const openEdit = useGuestModalStore((s) => s.openEdit);
  const openDelete = useGuestModalStore((s) => s.openDelete);
  const openDuplicate = useGuestModalStore((s) => s.openDuplicate);
  const { canCreate, canUpdate, canDelete } = useAccess();
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
  const canDuplicate = canCreate("guests");
  const hasCrudActions = canEdit || canRemove || canDuplicate;

  // Footer headline = party-size sum for the status in view. "All" headlines
  // the confirmed/attending total; a specific filter headlines its own status.
  const headlineStatus: GuestStatus =
    statusFilter === "all" ? "confirmed" : statusFilter;
  const headlineCount = guests.reduce(
    (sum, g) =>
      g.status === headlineStatus ? sum + (g.guest_count ?? 1) : sum,
    0,
  );
  const headlineLabel =
    headlineStatus === "confirmed" ? "attending" : headlineStatus;

  const headerChecked: boolean | "indeterminate" = allFilteredSelected
    ? true
    : someFilteredSelected
      ? "indeterminate"
      : false;

  const columns: DataTableColumn[] = [
    {
      label: (
        <Checkbox
          checked={headerChecked}
          onCheckedChange={onToggleAllFiltered}
          disabled={guests.length === 0}
          aria-label="Select all guests"
        />
      ),
      className: "flex items-center",
    },
    {
      label: <span className="flex items-center gap-1.5">Guests</span>,
    },
    { label: "Party" },
    { label: "Status" },
    { label: "Registered", hideBelowSm: true },
    { label: "Actions", align: "right" },
  ];

  return (
    <DataTable
      fill
      colsClass={ROW_COLS}
      columns={columns}
      isEmpty={guests.length === 0}
      emptyMessage="No guests match your search."
      items={guests}
      getRowId={(guest) => guest.id}
      renderRow={(guest) => (
        <GuestsRow
          key={guest.id}
          guest={guest}
          isSelected={selectedIds.has(guest.id)}
          onToggle={onToggleRow}
          openDetail={openDetail}
          openEdit={openEdit}
          openDelete={openDelete}
          openDuplicate={openDuplicate}
          canEdit={canEdit}
          canRemove={canRemove}
          canDuplicate={canDuplicate}
          hasCrudActions={hasCrudActions}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={updateStatus.isPending}
        />
      )}
      footer={
        <DataTableTotalRow>
          <div className="col-span-full flex items-center justify-between">
            <span className="text-xs">
              Total{" "}
              <span className="font-medium text-muted-foreground">
                · {guests.length} {guests.length === 1 ? "result" : "results"}
              </span>
            </span>
            <span className="flex items-baseline gap-1">
              <span className="font-display text-sm tabular-nums">
                {headlineCount}
              </span>
              <span className="text-2xs font-medium text-muted-foreground">
                {headlineLabel}
              </span>
            </span>
          </div>
        </DataTableTotalRow>
      }
    />
  );
};

export default GuestsTable;
