import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollView } from "@/components/custom/scroll-view";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { useCloseOnSuccess } from "@/components/custom/form";

import { useAccess } from "../../hooks/useAccess";
import { usePlan } from "../../hooks/usePlan";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestTargetPages } from "../hooks/useGuestTargetPages";
import { useGuestMutations, useGuestsQuery } from "../queries";
import type { GuestPageOption } from "../pageOptions";
import { phoneKey } from "@/lib/phone";
import PageChecklist from "../components/PageChecklist";
import GuestCapAlert from "../components/GuestCapAlert";
import type { Guest, ImportGuestPayload } from "../types";

interface AssignmentPlan {
  /** One call per distinct set of missing pages — import_guests writes one guest
   *  list to one page list, so guests needing different pages can't share one. */
  batches: { invitationIds: string[]; guests: ImportGuestPayload[] }[];
  /** Rows to delete when the move toggle is on. Blocked guests never appear
   *  here: removing a guest whose copy was refused would lose them entirely. */
  removeIds: string[];
  /** Rows that will be written, and what they cost against the plan. */
  addedRows: number;
  heads: number;
  perPageAdds: Map<string, number>;
  alreadyThere: number;
  blockedSize: Guest[];
  blockedPhone: Guest[];
  /** Pages that turned a guest away, so the UI can name the conflict. */
  sizeConflictPages: GuestPageOption[];
  privatePages: GuestPageOption[];
}

/**
 * Works out exactly which rows the assignment writes. A guest already on a
 * target page is written only to the pages they're missing — the server skips a
 * repeated phone, but a guest with no phone has no identity across pages and
 * would otherwise be duplicated onto the page they already sit on.
 */
export function planAssignment(
  selected: Guest[],
  allGuests: Guest[],
  targetPages: GuestPageOption[],
  removeOthers: boolean,
): AssignmentPlan {
  const targetIds = targetPages.map((p) => p.id);
  const pageById = new Map(targetPages.map((p) => [p.id, p]));

  const pagesByPhone = new Map<string, Set<string>>();
  for (const g of allGuests) {
    if (!g.phone || !g.invitation_id) continue;
    const key = phoneKey(g.phone);
    const set = pagesByPhone.get(key) ?? new Set<string>();
    set.add(g.invitation_id);
    pagesByPhone.set(key, set);
  }

  // The list holds one row per (guest, page), so the same person can be selected
  // twice. The server writes a (page, phone) once, so counting both rows would
  // charge the cap twice and promise a row that never lands.
  const claimed = new Set<string>();

  const batches = new Map<string, { invitationIds: string[]; guests: ImportGuestPayload[] }>();
  const perPageAdds = new Map<string, number>();
  const removeIds: string[] = [];
  const blockedSize: Guest[] = [];
  const blockedPhone: Guest[] = [];
  const sizeConflict = new Set<string>();
  const privateBlock = new Set<string>();
  let addedRows = 0;
  let heads = 0;
  let alreadyThere = 0;

  for (const guest of selected) {
    const key = guest.phone ? phoneKey(guest.phone) : null;
    const on = key
      ? (pagesByPhone.get(key) ?? new Set<string>())
      : new Set<string>(guest.invitation_id ? [guest.invitation_id] : []);
    const onTargets = targetIds.filter((id) => !on.has(id));
    // Pages an earlier row of this same person already claimed cost nothing.
    const missing = key
      ? onTargets.filter((id) => !claimed.has(`${id}|${key}`))
      : onTargets;
    const missingPages = missing.map((id) => pageById.get(id)!);

    const badSize = missingPages.filter(
      (p) => guest.guest_count < p.minGuest || guest.guest_count > p.maxGuest,
    );
    if (badSize.length > 0) {
      blockedSize.push(guest);
      badSize.forEach((p) => sizeConflict.add(p.id));
      continue;
    }

    const badPhone = guest.phone
      ? []
      : missingPages.filter((p) => p.mode === "private");
    if (badPhone.length > 0) {
      blockedPhone.push(guest);
      badPhone.forEach((p) => privateBlock.add(p.id));
      continue;
    }

    if (missing.length === 0) {
      // Nothing to write. Only say "already there" when the pages really hold
      // them — a row whose pages a sibling row just claimed is neither.
      if (onTargets.length === 0) alreadyThere++;
    } else {
      const batchKey = missing.join("|");
      const batch = batches.get(batchKey) ?? { invitationIds: missing, guests: [] };
      batch.guests.push({
        name: guest.name,
        phone: guest.phone,
        guest_count: guest.guest_count,
        status: guest.status,
        message: guest.message,
      });
      batches.set(batchKey, batch);
      missing.forEach((id) => {
        perPageAdds.set(id, (perPageAdds.get(id) ?? 0) + 1);
        if (key) claimed.add(`${id}|${key}`);
      });
      addedRows += missing.length;
      heads += guest.guest_count * missing.length;
    }

    if (
      removeOthers &&
      guest.invitation_id &&
      !targetIds.includes(guest.invitation_id)
    ) {
      removeIds.push(guest.id);
    }
  }

  return {
    batches: [...batches.values()],
    removeIds,
    addedRows,
    heads,
    perPageAdds,
    alreadyThere,
    blockedSize,
    blockedPhone,
    sizeConflictPages: targetPages.filter((p) => sizeConflict.has(p.id)),
    privatePages: targetPages.filter((p) => privateBlock.has(p.id)),
  };
}

const nameList = (rows: Guest[]) => {
  const shown = rows.slice(0, 3).map((r) => r.name);
  return rows.length > 3
    ? `${shown.join(", ")} and ${rows.length - 3} more`
    : shown.join(", ");
};

const pageList = (pages: GuestPageOption[]) => pages.map((p) => p.label).join(", ");

/** Bulk page assignment: additive by default, a move when the toggle is on. */
const GuestBulkPagesSheet = () => {
  const isBulkPagesOpen = useGuestModalStore((s) => s.isBulkPagesOpen);
  const bulkPagesIds = useGuestModalStore((s) => s.bulkPagesIds);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const clearSelection = useGuestModalStore((s) => s.clearSelection);

  const { canDelete } = useAccess();
  const { meter } = usePlan();
  const { allPages } = useGuestTargetPages();
  const { data: guests } = useGuestsQuery();
  const { assignGuestPages } = useGuestMutations();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removeOthers, setRemoveOthers] = useState(false);

  // The sheet stays mounted between opens; start each one from nothing chosen,
  // and clear the last run's outcome off the submit button.
  const resetAssign = assignGuestPages.reset;
  useEffect(() => {
    if (!isBulkPagesOpen) return;
    setSelectedIds([]);
    setRemoveOthers(false);
    resetAssign();
  }, [isBulkPagesOpen, resetAssign]);

  useCloseOnSuccess(assignGuestPages.isSuccess, () => {
    clearSelection();
    closeAll();
  });

  const canRemove = canDelete("guests");
  const moving = removeOthers && canRemove;

  const selected = useMemo(() => {
    const ids = new Set(bulkPagesIds);
    return (guests ?? []).filter((g) => ids.has(g.id));
  }, [guests, bulkPagesIds]);

  const targetPages = useMemo(
    () => allPages.filter((p) => selectedIds.includes(p.id)),
    [allPages, selectedIds],
  );

  const plan = useMemo(
    () => planAssignment(selected, guests ?? [], targetPages, moving),
    [selected, guests, targetPages, moving],
  );

  const { remaining } = meter("guests");
  const overCap = plan.heads > remaining;
  const hasWork = plan.batches.length > 0 || plan.removeIds.length > 0;
  const pageCount = targetPages.length;
  const pagesLabel = `${pageCount} ${pageCount === 1 ? "page" : "pages"}`;

  const toggle = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  return (
    <Sheet open={isBulkPagesOpen} onOpenChange={closeAll}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add to pages</SheetTitle>
          <SheetDescription>
            {selected.length} {selected.length === 1 ? "guest" : "guests"}{" "}
            selected. They keep the pages they're already on unless you turn on
            the move below.
          </SheetDescription>
        </SheetHeader>

        <ScrollView className="px-4 py-2">
          <div className="grid gap-3">
            <PageChecklist
              pages={allPages}
              selectedIds={selectedIds}
              onToggle={toggle}
              meta={(p) =>
                selectedIds.includes(p.id) && plan.perPageAdds.get(p.id)
                  ? `+${plan.perPageAdds.get(p.id)}`
                  : null
              }
            />

            {canRemove && (
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-input px-3 py-2.5">
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    Also remove from other pages
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Turns this into a move — the guests leave every page you
                    didn't pick.
                  </span>
                </span>
                <Switch
                  checked={removeOthers}
                  onCheckedChange={setRemoveOthers}
                  aria-label="Also remove from other pages"
                />
              </label>
            )}

            {(plan.blockedSize.length > 0 || plan.blockedPhone.length > 0) && (
              <Alert variant="warning">
                <AlertTitle>Some guests can't go on these pages</AlertTitle>
                <AlertDescription>
                  {plan.blockedSize.length > 0 && (
                    <p>
                      {pageList(plan.sizeConflictPages)} won't take these party
                      sizes: {nameList(plan.blockedSize)}.
                    </p>
                  )}
                  {plan.blockedPhone.length > 0 && (
                    <p>
                      {pageList(plan.privatePages)} is reserved, so every guest
                      needs a phone number: {nameList(plan.blockedPhone)}.
                    </p>
                  )}
                  {plan.batches.length > 0 && (
                    <p>Everyone else will still be added.</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {overCap && (
              <GuestCapAlert heads={plan.heads} remaining={remaining} />
            )}

            {pageCount > 0 && (
              <div className="grid gap-0.5 text-xs text-muted-foreground">
                <p>
                  {plan.addedRows} new{" "}
                  {plan.addedRows === 1 ? "entry" : "entries"} across{" "}
                  {pagesLabel}.
                </p>
                {plan.alreadyThere > 0 && (
                  <p>{plan.alreadyThere} already on every page you picked.</p>
                )}
                {plan.removeIds.length > 0 && (
                  <p>
                    {plan.removeIds.length} will be removed from their current
                    page.
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollView>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={closeAll}>
            Cancel
          </Button>
          <SubmitButton
            type="button"
            disabled={pageCount === 0 || !hasWork || overCap}
            isPending={assignGuestPages.isPending}
            isSuccess={assignGuestPages.isSuccess}
            isError={assignGuestPages.isError}
            onClick={() =>
              assignGuestPages.mutate({
                batches: plan.batches,
                removeIds: plan.removeIds,
                guestCount: selected.length,
                pageCount,
              })
            }
          >
            {moving ? "Move to" : "Add to"}{" "}
            {pageCount > 0 ? pagesLabel : "pages"}
          </SubmitButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default GuestBulkPagesSheet;
