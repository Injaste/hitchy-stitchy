import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import ComponentFade from "@/components/animations/animate-component-fade";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";
import { listLayoutTransition } from "@/lib/animations";

import { useAdminStore } from "../../store/useAdminStore";
import { useDayModalStore } from "../hooks/useDayModalStore";
import { useDayMutations, useDayItemsQuery } from "../queries";

const DayDeleteModal = () => {
  const isDeleteOpen = useDayModalStore((s) => s.isDeleteOpen);
  const selectedItem = useDayModalStore((s) => s.selectedItem);
  const closeAll = useDayModalStore((s) => s.closeAll);

  const { eventId } = useAdminStore();
  const { remove } = useDayMutations();

  // The day's schedule items — only while the modal is open. The delete_day RPC
  // enforces the same guard; this list just explains it.
  // isPending (not isLoading): true from the first render the query is enabled,
  // so the skeleton mounts immediately on open. isLoading would be false on that
  // first render (RQ starts fetching in an effect), flashing content first.
  const { data: items, isPending: itemsLoading } = useDayItemsQuery(
    selectedItem?.date ?? "",
    isDeleteOpen && !!selectedItem,
  );
  const hasItems = (items?.length ?? 0) > 0;

  // Grow the items box height only when content follows a loading state. If the
  // items were cached (modal opens straight to content), render it at full
  // height with no animation — nothing loaded, so nothing should grow.
  const grewFromLoadingRef = useRef(false);
  if (isDeleteOpen && itemsLoading) grewFromLoadingRef.current = true;
  useEffect(() => {
    if (!isDeleteOpen) grewFromLoadingRef.current = false;
  }, [isDeleteOpen]);

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const day = selectedItem;

  // Skeleton and the message share a min-height, so the crossfade holds the
  // modal at one height; only the items box animates the height (from 0).
  const renderBody = () => {
    if (itemsLoading) {
      return (
        <ComponentFade key="checking" useBlur initialVisible>
          <p className="min-h-12 text-muted-foreground">
            Checking for items associated with{" "}
            <span className="font-medium text-foreground">{day.label}</span>…
          </p>
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="content" useBlur>
        <p className="min-h-12">
          {hasItems ? (
            <>
              <span className="font-medium text-foreground">{day.label}</span>{" "}
              still has schedule items. Remove them first, then you can delete
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
        {hasItems && (
          <motion.div
            initial={grewFromLoadingRef.current ? { height: 0 } : false}
            animate={{ height: "auto" }}
            transition={listLayoutTransition}
            className="overflow-hidden mt-2"
          >
            <div className="rounded-md border border-border/60 bg-muted/30 p-2 text-left">
              <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                Timeline
              </p>
              <ul className="list-disc space-y-0.5 pl-5 text-sm text-foreground marker:text-muted-foreground">
                {items!.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <span className="block truncate">{item.title}</span>
                  </li>
                ))}
                {items!.length > 5 && (
                  <li className="list-none text-muted-foreground">
                    +{items!.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
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
      confirmDisabled={itemsLoading || hasItems}
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
