import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskMutations } from "../queries";
import { useTaskLabelFilterStore } from "../hooks/useTaskLabelFilter";
import { ALL_LABEL, type TaskFormValues } from "../types";

import TaskForm from "./TaskForm";

const TaskCreateModal = () => {
  const isCreateOpen = useTaskModalStore((s) => s.isCreateOpen);
  const closeAll = useTaskModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useTaskMutations();
  const activeLabel = useTaskLabelFilterStore((s) => s.activeLabel);
  const prefillLabel = activeLabel !== ALL_LABEL ? activeLabel : "";

  const handleSubmit = (values: TaskFormValues) => {
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
  };

  return (
    <Dialog open={isCreateOpen} onOpenChange={closeAll}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>
            Create a new task for this event.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          defaultValues={{ label: prefillLabel }}
          onSubmit={handleSubmit}
          onCancel={closeAll}
          isPending={create.isPending}
          submitLabel="Add task"
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreateModal;
