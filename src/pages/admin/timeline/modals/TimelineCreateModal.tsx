import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useTimelineModalStore } from "../hooks/useTimelineStore";
import { useTimelineMutations } from "../queries";
import type { TimelineItemFormValues } from "../types";

import TimelineItemForm from "./TimelineItemForm";

const CreateTimelineItemModal = () => {
  const isCreateOpen = useTimelineModalStore((state) => state.isCreateOpen);
  const closeAll = useTimelineModalStore((state) => state.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useTimelineMutations();

  const handleSubmit = (values: TimelineItemFormValues) => {
    create.mutate({ event_id: eventId!, ...values });
  };

  return (
    <Dialog open={isCreateOpen} onOpenChange={closeAll}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle >Add schedule item</DialogTitle>
          <DialogDescription>Timeline Description</DialogDescription>
        </DialogHeader>
        <TimelineItemForm
          onSubmit={handleSubmit}
          onCancel={closeAll}
          isPending={create.isPending}
          submitLabel="Add item"
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTimelineItemModal;
