import {
  Dialog,
  DialogContent,
  DialogDescription,
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
    update.mutate({ id: item.id, ...values });
  };

  return (
    <Dialog open={isEditOpen} onOpenChange={closeAll}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle >Edit item</DialogTitle>
          <DialogDescription>Timeline Description</DialogDescription>
        </DialogHeader>
        <TimelineItemForm
          defaultValues={{
            day: item.day,
            label: item.label ?? "",
            time_start: item.time_start,
            time_end: item.time_end ?? "",
            title: item.title,
            description: item.description ?? "",
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
