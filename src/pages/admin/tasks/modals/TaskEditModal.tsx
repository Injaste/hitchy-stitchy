import { ListTodo } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import TaskForm, { useTaskForm } from "./TaskForm";

const TaskEditModal = () => {
  const isEditOpen = useTaskModalStore((s) => s.isEditOpen);
  const selectedItem = useTaskModalStore((s) => s.selectedItem);
  const closeAll = useTaskModalStore((s) => s.closeAll);
  const { eventId } = useAdminStore();
  const { update } = useTaskMutations();

  // Hook before guard. Parent index keys this modal by selectedItem.id so
  // useForm re-initialises with fresh defaults on every task selection.
  const form = useTaskForm({
    defaultValues: selectedItem
      ? {
          title: selectedItem.title,
          details: selectedItem.details ?? "",
          label: selectedItem.label ?? "",
          priority: selectedItem.priority,
          due_at: selectedItem.due_at,
          assignees: selectedItem.assignees,
        }
      : undefined,
    onSubmit: (values) => {
      if (!selectedItem) return;
      update.mutate({
        event_id: eventId!,
        id: selectedItem.id,
        title: values.title,
        details: values.details,
        label: values.label,
        status: selectedItem.status,
        priority: values.priority,
        due_at: values.due_at,
        assignees: values.assignees,
      });
    },
  });

  if (!selectedItem) return null;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={update.isPending}
      isSuccess={update.isSuccess}
      isError={update.isError}
    >
      <FormHeader icon={<ListTodo className="size-4" />} title="Edit task" />

      <TaskForm />

      <FormFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default TaskEditModal;
