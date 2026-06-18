import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations, useGuestsQuery } from "../queries";
import {
  useInvitationsQuery,
  useEventSegmentsQuery,
} from "../../invitation/queries";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { pageLabel } from "../../invitation/utils";

// Copy an existing guest onto other invitation pages — separate rows per page,
// created atomically via the same create_guest_on_pages RPC as Add Guest.
const GuestDuplicateModal = () => {
  const isDuplicateOpen = useGuestModalStore((s) => s.isDuplicateOpen);
  const guest = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { create } = useGuestMutations();

  const { days } = useActiveEventDay();
  const { data: invitations } = useInvitationsQuery();
  const { data: segments } = useEventSegmentsQuery();
  const { data: guests } = useGuestsQuery();

  const [selected, setSelected] = useState<string[]>([]);

  // Eligible targets: every page except the ones the guest is already on. With a
  // phone we can match across pages; without one, just exclude their current page.
  const pages = useMemo(() => {
    if (!guest) return [];
    const onPages = new Set<string>([guest.invitation_id ?? ""]);
    if (guest.phone) {
      (guests ?? []).forEach((g) => {
        if (g.phone === guest.phone && g.invitation_id) onPages.add(g.invitation_id);
      });
    }
    const dayIdx = (id: string) => days.findIndex((d) => d.id === id);
    return [...(invitations ?? [])]
      .filter((i) => !onPages.has(i.id))
      .sort((a, b) => {
        const byDay = dayIdx(a.day_id) - dayIdx(b.day_id);
        if (byDay !== 0) return byDay;
        const rank = (s: string | null) => (s === null ? 0 : 1);
        const byRoot = rank(a.segment_id) - rank(b.segment_id);
        return byRoot !== 0 ? byRoot : a.created_at.localeCompare(b.created_at);
      })
      .map((p) => ({ id: p.id, label: pageLabel(p, days, segments ?? []) }));
  }, [guest, guests, invitations, days, segments]);

  // Fresh selection each open; close once the copy lands.
  useEffect(() => {
    if (isDuplicateOpen) setSelected([]);
  }, [isDuplicateOpen]);
  useEffect(() => {
    if (create.isSuccess) closeAll();
  }, [create.isSuccess, closeAll]);

  if (!guest) return null;

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const confirm = () =>
    create.mutate({
      invitationIds: selected,
      name: guest.name,
      phone: guest.phone,
      guest_count: guest.guest_count,
      status: guest.status,
      message: guest.message,
    });

  return (
    <Dialog open={isDuplicateOpen} onOpenChange={closeAll}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Copy “{guest.name}” to pages</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {pages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {guest.name} is already on every invitation page.
            </p>
          ) : (
            <div className="space-y-2 rounded-lg border p-2.5">
              {pages.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={closeAll}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={selected.length === 0 || create.isPending}
          >
            {create.isPending
              ? "Copying…"
              : selected.length > 0
                ? `Copy to ${selected.length} ${selected.length === 1 ? "page" : "pages"}`
                : "Copy to pages"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuestDuplicateModal;
