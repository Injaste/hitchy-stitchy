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
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskMutations } from "../queries";
import { useTasksFilterStore } from "../hooks/useTasksFilter";
import { ALL_LABEL } from "../types";

import TaskForm, { useTaskForm } from "./TaskForm";

const TaskCreateModal = () => {
  const isCreateOpen = useTaskModalStore((s) => s.isCreateOpen);
  const closeAll = useTaskModalStore((s) => s.closeAll);
  const isCreateMore = useTaskModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useTaskModalStore((s) => s.setIsCreateMore);
  const { eventId } = useAdminStore();
  const { create } = useTaskMutations();
  const activeLabel = useTasksFilterStore((s) => s.activeLabel);
  const prefillLabel = activeLabel !== ALL_LABEL ? activeLabel : "";

  const form = useTaskForm({
    defaultValues: { label: prefillLabel },
    onSubmit: (values) => {
      create.mutate({
        event_id: eventId!,
        title: values.title,
        details: values.details,
        label: values.label,
        status: "todo",
        priority: values.priority,
        due_at: values.due_at,
        assignees: values.assignees,
      });
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
        <DialogTitle>Add task</DialogTitle>
        <DialogDescription>
          Create a new task for this event.
        </DialogDescription>
      </DialogHeader>

      <TaskForm />

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
          <SubmitButton>Add task</SubmitButton>
        </div>
      </DialogFooter>
    </FormDialog>
  );
};

export default TaskCreateModal;
