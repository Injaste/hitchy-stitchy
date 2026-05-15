import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormDialog, SubmitButton } from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineMutations } from "../queries";

import TimelineItemForm, { useTimelineItemForm } from "./TimelineItemForm";

const CreateTimelineItemModal = () => {
  const isCreateOpen = useTimelineModalStore((s) => s.isCreateOpen);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useTimelineMutations();

  const form = useTimelineItemForm({
    onSubmit: (values) => {
      create.mutate({ event_id: eventId!, ...values });
    },
  });

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
    >
      <DialogHeader>
        <DialogTitle>Add schedule item</DialogTitle>
        <DialogDescription>
          Add a new item to the event timeline.
        </DialogDescription>
      </DialogHeader>

      <TimelineItemForm />

      <Separator />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeAll}>
          Cancel
        </Button>
        <SubmitButton>Add item</SubmitButton>
      </DialogFooter>
    </FormDialog>
  );
};

export default CreateTimelineItemModal;
