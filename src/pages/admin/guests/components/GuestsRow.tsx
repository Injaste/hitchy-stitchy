import { memo, type FC } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { itemFadeIn } from "@/lib/animations";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import NotesTooltip from "@/components/custom/notes-tooltip";
import DataTableRow from "@/components/custom/tables/data-table-row";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { STATUS_LABELS, type Guest, type GuestStatus } from "../types";
import { RSVP_MODE_META } from "../../invitation/rsvpMeta";

/** Shared sheet column template — header and rows stay in sync.
 *  Mobile: select · guest · party · status · actions.
 *  Desktop (sm+): inserts the registered-on column before actions. */
export const ROW_COLS =
  "grid-cols-[1.5rem_minmax(0,1fr)_3rem_3rem_3rem] sm:grid-cols-[1.5rem_minmax(0,1fr)_4rem_3.5rem_6rem_4.5rem]";

interface GuestsRowProps {
  guest: Guest;
  isSelected: boolean;
  onToggle: (id: string) => void;
  openDetail: (guest: Guest) => void;
  openEdit: () => void;
  openDelete: () => void;
  canEdit: boolean;
  canRemove: boolean;
  hasCrudActions: boolean;
  onUpdateStatus: (guest: Guest, status: GuestStatus) => void;
  isUpdating: boolean;
}

const STATUS_ICON = {
  confirmed: { icon: CheckCircle, className: "text-success" },
  pending: { icon: Clock, className: "text-warning" },
  cancelled: { icon: XCircle, className: "text-destructive" },
} satisfies Record<
  GuestStatus,
  { icon: typeof CheckCircle; className: string }
>;

const GuestsRow: FC<GuestsRowProps> = memo(
  ({
    guest,
    isSelected,
    onToggle,
    openDetail,
    openEdit,
    openDelete,
    canEdit,
    canRemove,
    hasCrudActions,
    onUpdateStatus,
    isUpdating,
  }) => {
    const statusMeta = STATUS_ICON[guest.status];
    const StatusIcon = statusMeta.icon;
    const SourceIcon = RSVP_MODE_META[guest.source].icon;

    return (
      <DataTableRow
        element="div"
        selected={isSelected}
        onClick={() => openDetail(guest)}
      >
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(guest.id)}
            aria-label={`Select ${guest.name}`}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              title={
                guest.source === "private"
                  ? "Reserved — pre-loaded private guest"
                  : "Public — RSVP-ed via the link"
              }
              className="inline-flex shrink-0 text-muted-foreground"
            >
              <SourceIcon
                role="img"
                aria-label={guest.source === "private" ? "Reserved" : "Public"}
                className="size-3.5"
              />
            </span>
            <p className="truncate font-medium leading-tight text-foreground">
              {guest.name}
            </p>
            <NotesTooltip notes={guest.message} />
          </div>
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

        <div className="text-right" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence>
            {guest.status === "pending" && (
              <motion.div variants={itemFadeIn} className="inline">
                <Button
                  variant="ghost-success"
                  size="icon-sm"
                  onClick={() => onUpdateStatus(guest, "confirmed")}
                  disabled={isUpdating}
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {guest.status !== "confirmed" && (
                <DropdownMenuItem
                  variant="success"
                  onClick={() => onUpdateStatus(guest, "confirmed")}
                  disabled={isUpdating}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm
                </DropdownMenuItem>
              )}
              {guest.status !== "cancelled" && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onUpdateStatus(guest, "cancelled")}
                  disabled={isUpdating}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              )}

              {hasCrudActions && <DropdownMenuSeparator />}

              {canEdit && (
                <DropdownMenuItem
                  onClick={() => {
                    openDetail(guest);
                    openEdit();
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canRemove && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    openDetail(guest);
                    openDelete();
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DataTableRow>
    );
  },
);

export default GuestsRow;
