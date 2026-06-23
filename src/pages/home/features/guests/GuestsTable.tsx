import type { FC } from "react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/tables/data-table";
import DataTableTotalRow from "@/components/custom/tables/data-table-total-row";
import type { Guest, GuestStatus } from "../types";

import GuestsRow, { ROW_COLS } from "./GuestsRow";

interface GuestsTableProps {
  guests: Guest[];
  statusFilter: GuestStatus | "all";
}

/** Stripped read-only guest list — no selection, no actions, no mutations. */
const GuestsTable: FC<GuestsTableProps> = ({ guests, statusFilter }) => {
  const headlineStatus: GuestStatus =
    statusFilter === "all" ? "confirmed" : statusFilter;
  const headlineCount = guests.reduce(
    (sum, g) =>
      g.status === headlineStatus ? sum + (g.guest_count ?? 1) : sum,
    0,
  );
  const headlineLabel =
    headlineStatus === "confirmed" ? "attending" : headlineStatus;

  const columns: DataTableColumn[] = [
    { label: "Guests" },
    { label: "Party" },
    { label: "Status" },
    { label: "Registered", hideBelowSm: true },
  ];

  return (
    <DataTable
      fill
      colsClass={ROW_COLS}
      columns={columns}
      isEmpty={guests.length === 0}
      emptyMessage="No guests yet."
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
    >
      {guests.map((guest) => (
        <GuestsRow key={guest.id} guest={guest} />
      ))}
    </DataTable>
  );
};

export default GuestsTable;
