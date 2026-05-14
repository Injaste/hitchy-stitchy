import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormDialog, SubmitButton } from "@/components/custom/form";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineMutations } from "../queries";
import { useAdminStore } from "../../store/useAdminStore";

import TimelineItemForm, { useTimelineItemForm } from "./TimelineItemForm";

const TimelineEditModal = () => {
  const isEditOpen = useTimelineModalStore((s) => s.isEditOpen);
  const selectedItem = useTimelineModalStore((s) => s.selectedItem);
  const closeAll = useTimelineModalStore((s) => s.closeAll);

  const { eventId } = useAdminStore();
  const { update } = useTimelineMutations();

  // Hook before guard. Parent index keys this modal by selectedItem.id so
  // useForm re-initialises with fresh defaults on every item selection.
  const form = useTimelineItemForm({
    defaultValues: selectedItem
      ? {
          day: selectedItem.day,
          label: selectedItem.label ?? "",
          time_start: selectedItem.time_start,
          time_end: selectedItem.time_end ?? "",
          title: selectedItem.title,
          details: selectedItem.details ?? "",
          assignees: selectedItem.assignees,
        }
      : undefined,
    onSubmit: (values) => {
      if (!selectedItem) return;
      update.mutate({ event_id: eventId, id: selectedItem.id, ...values });
    },
  });

  if (!selectedItem) return null;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={update.isPending}
    >
      <DialogHeader>
        <DialogTitle>Edit item</DialogTitle>
        <DialogDescription>
          Update the details of this schedule item.
        </DialogDescription>
      </DialogHeader>

      <TimelineItemForm />

      <Separator />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeAll}>
          Cancel
        </Button>
        <SubmitButton>Save changes</SubmitButton>
      </DialogFooter>
    </FormDialog>
  );
};

export default TimelineEditModal;
