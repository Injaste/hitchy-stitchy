import { memo, type FC } from "react";
import { format } from "date-fns";
import { CheckCircle, Clock, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import DataTableRow from "@/components/custom/tables/data-table-row";
import { STATUS_LABELS, type Guest, type GuestStatus } from "../types";

/** Stripped read-only guest row — no checkboxes, no action menus, no mutations. */
export const ROW_COLS =
  "grid-cols-[minmax(0,1fr)_3rem_3rem_3rem] sm:grid-cols-[minmax(0,1fr)_4rem_3.5rem_6rem]";

const STATUS_ICON = {
  confirmed: { icon: CheckCircle, className: "text-success" },
  pending: { icon: Clock, className: "text-warning" },
  cancelled: { icon: XCircle, className: "text-destructive" },
} satisfies Record<GuestStatus, { icon: typeof CheckCircle; className: string }>;

interface GuestsRowProps {
  guest: Guest;
}

const GuestsRow: FC<GuestsRowProps> = memo(({ guest }) => {
  const statusMeta = STATUS_ICON[guest.status];
  const StatusIcon = statusMeta.icon;

  return (
    <DataTableRow element="div">
      <div className="min-w-0">
        <p className="truncate font-medium leading-tight text-foreground">
          {guest.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {guest.phone}
        </p>
      </div>

      <div className="text-muted-foreground">{guest.guest_count}</div>

      <div title={STATUS_LABELS[guest.status]}>
        <StatusIcon
          role="img"
          aria-label={STATUS_LABELS[guest.status]}
          className={cn("size-4", statusMeta.className)}
        />
      </div>

      <div className="hidden text-xs text-muted-foreground sm:block">
        {format(new Date(guest.created_at), "d MMM yyyy")}
      </div>
    </DataTableRow>
  );
});

export default GuestsRow;
