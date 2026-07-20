import type { FC } from "react";
import { Plus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatSGD } from "@/lib/money";
import { cn } from "@/lib/utils";

import { useAccess } from "../../hooks/useAccess";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { dayLabel } from "../../days/utils";
import { useBudgetQuery } from "../../budget/queries";
import { useExpenseModalStore } from "../../budget/hooks/useExpenseModalStore";
import type { Expense } from "../../budget/types";
import { useVendorModalStore } from "../hooks/useVendorModalStore";
import { useValidVendorDayFilter } from "../hooks/useVendorDayFilter";
import type { Vendor } from "../types";

interface VendorSpendProps {
  /** The whole vendor, not just its id — the hand-off needs it to reopen this
   *  detail once the expense modal closes. */
  vendor: Vendor;
}

/** What this vendor has cost, DERIVED from its linked expenses — never stored on
 *  the vendor, so there's nothing to keep in sync. Money lives in Budget; this is
 *  a read of it filtered to one vendor, plus the two entry points back into the
 *  Budget modals (reused wholesale, not reimplemented).
 *
 *  Mounted only when the caller has budget read rights, so the query never fires
 *  for an Admin who manages vendors but can't see money. RLS enforces it anyway
 *  (event_expenses is super-admin only) — the gate here is UX. */
const VendorSpend: FC<VendorSpendProps> = ({ vendor }) => {
  const { data } = useBudgetQuery();
  const { days } = useActiveEventDay();
  const { canCreate } = useAccess();
  const openEditItem = useExpenseModalStore((s) => s.openEditItem);
  const openCreateForVendor = useExpenseModalStore(
    (s) => s.openCreateForVendor,
  );
  const setOnCloseReturn = useExpenseModalStore((s) => s.setOnCloseReturn);
  const closeVendor = useVendorModalStore((s) => s.closeAll);
  const openDetail = useVendorModalStore((s) => s.openDetail);
  const filterDayId = useValidVendorDayFilter();

  // Which day a new cost most likely belongs to, best guess first: the vendor's
  // own day when it's booked for exactly one (it can't be anything else), else
  // whatever day the list is filtered to, else the first day. Never null, so the
  // Day select is always answered and visible rather than silently defaulting.
  const presetDayId =
    vendor.day_ids.length === 1
      ? vendor.day_ids[0]
      : (filterDayId ?? days[0]?.id ?? null);

  // Step OUT of the vendor detail rather than stacking a second dialog on top of
  // it — the same handoff openEdit/openDelete already do on this modal — and
  // register the way back, which the expense store fires from its closeAll. The
  // expense modals are mounted at the page level, so closing this one doesn't
  // unmount them mid-flight.
  const handOff = (open: () => void) => () => {
    setOnCloseReturn(() => openDetail(vendor));
    closeVendor();
    open();
  };

  const buckets = data?.buckets ?? [];
  const linked = (data?.expenses ?? []).filter((e) => e.vendor_id === vendor.id);

  const total = linked.reduce((sum, e) => sum + e.amount, 0);
  const paid = linked.reduce((sum, e) => sum + e.paid, 0);
  const outstanding = total - paid;

  const dayOf = (expense: Expense) =>
    buckets.find((b) => b.id === expense.budget_id)?.day_id ?? null;

  // Walk the event's days so groups read chronologically. Anything whose bucket
  // no longer resolves to a day falls into a trailing "Unscheduled" group rather
  // than silently vanishing from the totals' breakdown.
  const groups = days
    .map((day, index) => ({
      key: day.id,
      label: dayLabel(day.label, index),
      // A cost can sit on a day the vendor isn't booked for — you might drop a
      // day from their booking after paying, or pay a deposit against another
      // day's budget. That's legitimate, not corrupt, so it's flagged rather
      // than blocked (and never struck through: the money is real and counted).
      booked: vendor.day_ids.includes(day.id),
      items: linked.filter((e) => dayOf(e) === day.id),
    }))
    .filter((g) => g.items.length > 0);
  const orphans = linked.filter((e) => !days.some((d) => d.id === dayOf(e)));
  if (orphans.length) {
    groups.push({
      key: "orphans",
      label: "Unscheduled",
      booked: true,
      items: orphans,
    });
  }

  const canAdd = canCreate("budget");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Wallet className="size-3 shrink-0" />
          Spend
        </p>
        {canAdd && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handOff(() => openCreateForVendor(vendor.id, presetDayId))}
          >
            <Plus className="size-3.5" />
            Add expense
          </Button>
        )}
      </div>

      {linked.length === 0 ? (
        <p className="text-sm text-muted-foreground/60 italic">
          No expenses linked to this vendor yet.
        </p>
      ) : (
        <>
          {/* Totals first — the answer most people opened this for. */}
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 px-3 py-2">
            {[
              { label: "Total", value: total, tone: "text-foreground" },
              { label: "Paid", value: paid, tone: "text-success" },
              {
                label: "Outstanding",
                value: outstanding,
                tone:
                  outstanding > 0 ? "text-warning" : "text-muted-foreground",
              },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="text-2xs tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "truncate font-display text-sm font-bold tabular-nums",
                    stat.tone,
                  )}
                >
                  {formatSGD(stat.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Then the breakdown, by day — the same dimension the vendor's own day
              tags use, so "who works when" and "what it cost when" line up. */}
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group.key} className="space-y-0.5">
                <p className="text-2xs tracking-wide text-muted-foreground/70 uppercase">
                  {group.label}
                  {!group.booked && (
                    <span
                      className="ml-1.5 normal-case text-muted-foreground/50"
                      title="This vendor isn't booked for this day — the cost still counts."
                    >
                      · not booked
                    </span>
                  )}
                </p>
                {group.items.map((expense) => (
                  <Button
                    key={expense.id}
                    variant="ghost"
                    size="sm"
                    onClick={handOff(() => openEditItem(expense))}
                    // normal-case: Button capitalizes by default, which is right
                    // for labels but mangles user-entered item names.
                    className="w-full justify-between gap-2 px-1.5 font-normal normal-case"
                  >
                    <span className="min-w-0 truncate">{expense.item}</span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatSGD(expense.amount)}
                    </span>
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VendorSpend;
