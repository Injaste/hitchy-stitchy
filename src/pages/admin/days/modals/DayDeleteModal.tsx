import { useEffect, useRef, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import ComponentFade from "@/components/animations/animate-component-fade";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { listLayoutTransition } from "@/lib/animations";

import { useAdminStore } from "../../store/useAdminStore";
import { useDayModalStore } from "../hooks/useDayModalStore";
import {
  useDayMutations,
  useDayTimelineQuery,
  useDayExpensesQuery,
  useDayGiftsQuery,
} from "../queries";

/** A labelled box of blocking entries (first 5 + "+N more"). Shared by the
 *  Timeline and Budget blockers so they render identically. */
const BlockerBox: FC<{
  label: string;
  entries: { id: string; name: string }[];
  animateGrow: boolean;
}> = ({ label, entries, animateGrow }) => (
  <motion.div
    initial={animateGrow ? { height: 0 } : false}
    animate={{ height: "auto" }}
    transition={listLayoutTransition}
    className="overflow-hidden mt-2"
  >
    <div className="rounded-md border border-border/60 bg-muted/30 p-2 text-left">
      <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="list-disc space-y-0.5 pl-5 text-sm text-foreground marker:text-muted-foreground">
        {entries.slice(0, 5).map((entry) => (
          <li key={entry.id}>
            <span className="block truncate">{entry.name}</span>
          </li>
        ))}
        {entries.length > 5 && (
          <li className="list-none text-muted-foreground">
            +{entries.length - 5} more
          </li>
        )}
      </ul>
    </div>
  </motion.div>
);

const DayDeleteModal = () => {
  const isDeleteOpen = useDayModalStore((s) => s.isDeleteOpen);
  const selectedItem = useDayModalStore((s) => s.selectedItem);
  const closeAll = useDayModalStore((s) => s.closeAll);

  const { eventId } = useAdminStore();
  const { remove } = useDayMutations();

  const enabled = isDeleteOpen && !!selectedItem;

  // What's tied to the day — only while the modal is open. The delete_day RPC
  // enforces the same guards (a RESTRICT FK behind each); these lists just
  // explain them. isPending (not isLoading): true from the first render the
  // query is enabled, so the skeleton mounts immediately on open.
  const { data: timeline, isPending: timelineLoading } = useDayTimelineQuery(
    selectedItem?.date ?? "",
    enabled,
  );
  const { data: expenses, isPending: expensesLoading } = useDayExpensesQuery(
    selectedItem?.id ?? "",
    enabled,
  );
  const { data: gifts, isPending: giftsLoading } = useDayGiftsQuery(
    selectedItem?.id ?? "",
    enabled,
  );

  const loading = timelineLoading || expensesLoading || giftsLoading;
  const hasTimeline = (timeline?.length ?? 0) > 0;
  const hasExpenses = (expenses?.length ?? 0) > 0;
  const hasGifts = (gifts?.length ?? 0) > 0;
  const hasBlockers = hasTimeline || hasExpenses || hasGifts;

  // Grow the boxes' height only when content follows a loading state. If the
  // data was cached (modal opens straight to content), render at full height
  // with no animation — nothing loaded, so nothing should grow.
  const grewFromLoadingRef = useRef(false);
  if (isDeleteOpen && loading) grewFromLoadingRef.current = true;
  useEffect(() => {
    if (!isDeleteOpen) grewFromLoadingRef.current = false;
  }, [isDeleteOpen]);

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const day = selectedItem;

  // "schedule items", "expenses", or "schedule items and expenses".
  const noun = [
    hasTimeline && "schedule items",
    hasExpenses && "expenses",
    hasGifts && "gifts",
  ]
    .filter(Boolean)
    .join(" and ");

  // Skeleton and the message share a min-height, so the crossfade holds the
  // modal at one height; only the boxes animate the height (from 0).
  const renderBody = () => {
    if (loading) {
      return (
        <ComponentFade key="checking" useBlur initialVisible>
          <p className="min-h-12 text-muted-foreground">
            Checking what's linked to{" "}
            <span className="font-medium text-foreground">{day.label}</span>…
          </p>
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="content" useBlur>
        <p className="min-h-12">
          {hasBlockers ? (
            <>
              <span className="font-medium text-foreground">{day.label}</span>{" "}
              still has {noun} tied to it. Remove them first, then you can delete
              the day.
            </>
          ) : (
            <>
              Remove{" "}
              <span className="font-medium text-foreground">{day.label}</span>?
              This can't be undone.
            </>
          )}
        </p>
        {hasTimeline && (
          <BlockerBox
            label="Timeline"
            entries={timeline!.map((i) => ({ id: i.id, name: i.title }))}
            animateGrow={grewFromLoadingRef.current}
          />
        )}
        {hasExpenses && (
          <BlockerBox
            label="Budget"
            entries={expenses!.map((e) => ({ id: e.id, name: e.item }))}
            animateGrow={grewFromLoadingRef.current}
          />
        )}
        {hasGifts && (
          <BlockerBox
            label="Gifts"
            entries={gifts!.map((g) => ({ id: g.id, name: g.given_by }))}
            animateGrow={grewFromLoadingRef.current}
          />
        )}
      </ComponentFade>
    );
  };

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Remove day"
      confirmLabel="Remove"
      confirmDisabled={loading || hasBlockers}
      onConfirm={() => remove.mutate({ event_id: eventId!, id: day.id })}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    >
      <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
    </ConfirmAlertModal>
  );
};

export default DayDeleteModal;
