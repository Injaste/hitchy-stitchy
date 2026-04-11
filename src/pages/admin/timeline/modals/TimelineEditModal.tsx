import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useTimelineModalStore } from "../hooks/useTimelineStore";
import { useTimelineMutations } from "../queries";
import type { TimelineItemFormValues } from "../types";

import TimelineItemForm from "./TimelineItemForm";

const TimelineEditModal = () => {
  const isEditOpen = useTimelineModalStore((s) => s.isEditOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);

  const { update } = useTimelineMutations();

  if (!selectedItem) return null;
  const item = selectedItem;

  const handleSubmit = (values: TimelineItemFormValues) => {
    update.mutate({
      id: item.id,
      label: values.label || null,
      day: values.day,
      timeStart: values.timeStart,
      timeEnd: values.timeEnd || null,
      title: values.title,
      description: values.description || null,
      notes: values.notes || null,
      assignees: values.assignees,
    });
  };

  return (
    <Dialog open={isEditOpen} onOpenChange={closeAll}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit item</DialogTitle>
        </DialogHeader>
        <TimelineItemForm
          defaultValues={{
            day: item.day,
            label: item.label ?? "",
            timeStart: item.timeStart,
            timeEnd: item.timeEnd ?? "",
            title: item.title,
            description: item.description ?? "",
            notes: item.notes ?? "",
            assignees: item.assignees,
          }}
          onSubmit={handleSubmit}
          onCancel={closeAll}
          isPending={update.isPending}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
};

export default TimelineEditModal;
