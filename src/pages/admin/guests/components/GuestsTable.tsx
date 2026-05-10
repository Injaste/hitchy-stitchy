import type { FC } from "react";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import type { Guest, GuestStatus } from "../types";

interface GuestsTableProps {
  guests: Guest[];
}

const statusBadge: Record<
  GuestStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  confirmed: { label: "Confirmed", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const GuestsTable: FC<GuestsTableProps> = ({ guests }) => {
  const openDetail = useGuestModalStore((s) => s.openDetail);
  const openEdit = useGuestModalStore((s) => s.openEdit);
  const openDelete = useGuestModalStore((s) => s.openDelete);
  const { canUpdate, canDelete } = useAccess();
  const { updateStatus } = useGuestMutations();

  const canEdit = canUpdate("rsvp");
  const canRemove = canDelete("rsvp");

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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
            {guests.map((guest) => {
              const badge = statusBadge[guest.status];
              return (
                <tr
                  key={guest.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => openDetail(guest)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-foreground leading-tight">
                      {guest.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
                    className="px-5 py-3.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {guest.status !== "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 mr-1"
                        onClick={() =>
                          updateStatus.mutate({ guest, status: "confirmed" })
                        }
                        disabled={updateStatus.isPending}
                      >
                        Confirm
                      </Button>
                    )}
                    {guest.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 text-destructive mr-1"
                        onClick={() =>
                          updateStatus.mutate({ guest, status: "cancelled" })
                        }
                        disabled={updateStatus.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          openDetail(guest);
                          openEdit();
                        }}
                        aria-label="Edit guest"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {canRemove && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          openDetail(guest);
                          openDelete();
                        }}
                        aria-label="Delete guest"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestsTable;
