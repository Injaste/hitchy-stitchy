import type { FC } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import type { Guest, GuestStatus } from "../types";

interface GuestsTableProps {
  guests: Guest[];
}

const statusBadge = {
  confirmed: { label: "Confirmed", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
} satisfies Record<
  GuestStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
>;

const COL_COUNT = 5;

const GuestsTable: FC<GuestsTableProps> = ({ guests }) => {
  const openDetail = useGuestModalStore((s) => s.openDetail);
  const openEdit = useGuestModalStore((s) => s.openEdit);
  const openDelete = useGuestModalStore((s) => s.openDelete);
  const { canUpdate, canDelete } = useAccess();
  const { updateStatus } = useGuestMutations();

  const canEdit = canUpdate("rsvp");
  const canRemove = canDelete("rsvp");

  const hasCrudActions = canEdit || canRemove;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            {/* Guest: takes what's left, never squishes below 160px */}
            <col className="min-w-40" />
            {/* Party: just a digit or two */}
            <col className="min-w-20 w-[10%]" />
            {/* Status: badge */}
            <col className="min-w-28 w-[16%]" />
            {/* Registered: short date */}
            <col className="min-w-36 w-[20%] hidden sm:table-column" />
            {/* Actions: single button */}
            <col className="min-w-20 w-[10%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-border bg-muted/40">
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
              guests.map((guest) => {
                const badge = statusBadge[guest.status];
                return (
                  <tr
                    key={guest.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => openDetail(guest)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground leading-tight truncate">
                        {guest.name}
                      </p>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {guest.status !== "confirmed" && (
                            <DropdownMenuItem
                              variant="success"
                              onClick={() =>
                                updateStatus.mutate({
                                  guest,
                                  status: "confirmed",
                                })
                              }
                              disabled={updateStatus.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {guest.status !== "cancelled" && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                updateStatus.mutate({
                                  guest,
                                  status: "cancelled",
                                })
                              }
                              disabled={updateStatus.isPending}
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestsTable;
