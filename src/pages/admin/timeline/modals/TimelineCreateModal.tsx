import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormDialog, SubmitButton } from "@/components/custom/form";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useTimelineMutations } from "../queries";

import TimelineItemForm, { useTimelineItemForm } from "./TimelineItemForm";

const CreateTimelineItemModal = () => {
  const isCreateOpen = useTimelineModalStore((s) => s.isCreateOpen);
  const closeAll = useTimelineModalStore((s) => s.closeAll);
  const isCreateMore = useTimelineModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useTimelineModalStore((s) => s.setIsCreateMore);
  const createPrefill = useTimelineModalStore((s) => s.createPrefill);
  const { eventId } = useAdminStore();
  const { create } = useTimelineMutations();

  const form = useTimelineItemForm({
    defaultValues: {
      day: createPrefill.day ?? "",
      label: createPrefill.label ?? "",
    },
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
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <DialogHeader>
        <DialogTitle>Add schedule item</DialogTitle>
        <DialogDescription>
          Add a new item to the event timeline.
        </DialogDescription>
      </DialogHeader>

      <TimelineItemForm />

      <Separator />

      <DialogFooter className="sm:justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="create-more"
            checked={isCreateMore}
            onCheckedChange={setIsCreateMore}
          />
          <Label
            htmlFor="create-more"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Create more
          </Label>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={closeAll}>
            Cancel
          </Button>
          <SubmitButton>Add item</SubmitButton>
        </div>
      </DialogFooter>
    </FormDialog>
  );
};

export default CreateTimelineItemModal;
