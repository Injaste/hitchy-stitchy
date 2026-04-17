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
import type { TaskFormValues } from "../types";

import TaskForm from "./TaskForm";

const TaskCreateModal = () => {
  const isCreateOpen = useTaskModalStore((s) => s.isCreateOpen);
  const closeAll = useTaskModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { create } = useTaskMutations();

  const handleSubmit = (values: TaskFormValues) => {
    create.mutate({
      event_id: eventId!,
      title: values.title,
      details: values.details,
      priority: values.priority,
      due_at: values.due_at,
      assignees: values.assignees,
    });
  };

  return (
    <Dialog open={isCreateOpen} onOpenChange={closeAll}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>
            Create a new task for this event.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
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
