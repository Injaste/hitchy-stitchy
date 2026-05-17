import { type FC } from "react";
import { useAccess } from "../../hooks/useAccess";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import type { Guest } from "../types";

import GuestsRow from "./GuestsRow";
import { SmoothScroll } from "@/components/custom/smooth-scroll";

interface GuestsTableProps {
  guests: Guest[];
}

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
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm table-fixed relative">
        <colgroup>
          <col className="min-w-40" />
          <col className="min-w-20 w-[10%]" />
          <col className="min-w-28 w-[16%]" />
          <col className="min-w-36 w-[20%] hidden sm:table-column" />
          <col className="min-w-20 w-[10%]" />
        </colgroup>

        <thead className="sticky top-0 bg-background z-10">
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
            <>
              {guests.map((guest) => (
                <GuestsRow
                  key={guest.id}
                  guest={guest}
                  openDetail={openDetail}
                  openEdit={openEdit}
                  openDelete={openDelete}
                  canEdit={canEdit}
                  canRemove={canRemove}
                  hasCrudActions={hasCrudActions}
                  updateStatus={updateStatus}
                />
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GuestsTable;
