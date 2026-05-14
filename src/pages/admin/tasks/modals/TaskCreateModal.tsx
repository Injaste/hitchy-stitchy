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
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskMutations } from "../queries";
import { useTaskLabelFilterStore } from "../hooks/useTaskLabelFilter";
import { ALL_LABEL } from "../types";

import TaskForm, { useTaskForm } from "./TaskForm";

const TaskCreateModal = () => {
  const isCreateOpen = useTaskModalStore((s) => s.isCreateOpen);
  const closeAll = useTaskModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useTaskMutations();
  const activeLabel = useTaskLabelFilterStore((s) => s.activeLabel);
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
    >
      <DialogHeader>
        <DialogTitle>Add task</DialogTitle>
        <DialogDescription>
          Create a new task for this event.
        </DialogDescription>
      </DialogHeader>

      <TaskForm />

      <Separator />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeAll}>
          Cancel
        </Button>
        <SubmitButton>Add task</SubmitButton>
      </DialogFooter>
    </FormDialog>
  );
};

export default TaskCreateModal;
