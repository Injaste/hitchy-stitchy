import { memo, type FC } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { itemFadeIn } from "@/lib/animations";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import NotesTooltip from "@/components/custom/notes-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Guest, GuestStatus } from "../types";

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

const statusBadge = {
  confirmed: { label: "Confirmed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "destructive" },
} satisfies Record<
  GuestStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
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
    const badge = statusBadge[guest.status];

    return (
      <tr
        key={guest.id}
        data-state={isSelected ? "selected" : undefined}
        className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors data-[state=selected]:bg-muted/50"
        onClick={() => openDetail(guest)}
      >
        <td
          className="px-5 py-3.5 align-middle"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(guest.id)}
            aria-label={`Select ${guest.name}`}
          />
        </td>

        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-foreground leading-tight truncate">
              {guest.name}
            </p>
            <NotesTooltip notes={guest.message} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {guest.phone}
          </p>
        </td>

        <td className="px-5 py-3.5 text-muted-foreground">
          {guest.guest_count}
        </td>

        <td className="px-5 py-3.5">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </td>

        <td className="px-5 py-3.5 text-muted-foreground text-xs hidden sm:table-cell">
          {format(new Date(guest.created_at), "d MMM yyyy")}
        </td>

        <td
          className="px-5 py-3.5 text-right"
          onClick={(e) => e.stopPropagation()}
        >
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
        </td>
      </tr>
    );
  },
);

export default GuestsRow;
