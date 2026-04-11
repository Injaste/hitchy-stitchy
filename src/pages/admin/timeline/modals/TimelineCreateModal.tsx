import {
  Dialog,
  DialogContent,
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
    create.mutate({
      eventId: eventId!,
      day: values.day,
      label: values.label || null,
      timeStart: values.timeStart,
      timeEnd: values.timeEnd || null,
      title: values.title,
      description: values.description || null,
      notes: values.notes || null,
      assignees: values.assignees,
    });
  };

  return (
    <Dialog open={isCreateOpen} onOpenChange={closeAll}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Add schedule item</DialogTitle>
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
