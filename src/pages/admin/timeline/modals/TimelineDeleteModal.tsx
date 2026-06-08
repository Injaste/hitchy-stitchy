import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

import { useTimelineMutations } from "../queries";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useAdminStore } from "../../store/useAdminStore";

const TimelineDeleteModal = () => {
  const isDeleteOpen = useTimelineModalStore((s) => s.isDeleteOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);

  const { eventId } = useAdminStore();
  const { remove } = useTimelineMutations();

  useCloseOnSuccess(remove.isSuccess, closeAll);

  if (!selectedItem) return null;
  const item = selectedItem;

  const handleConfirm = () => {
    remove.mutate({ event_id: eventId!, id: item.id, title: item.title });
  };

  return (
    <ConfirmAlertModal
      open={isDeleteOpen}
      onOpenChange={closeAll}
      variant="destructive"
      title="Delete item"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">"{item.title}"</span>?
          This action cannot be undone.
        </>
      }
      confirmLabel="Delete"
      onConfirm={handleConfirm}
      isPending={remove.isPending}
      isSuccess={remove.isSuccess}
      isError={remove.isError}
    />
  );
};

export default TimelineDeleteModal;
