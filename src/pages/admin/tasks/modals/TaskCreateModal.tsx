import { ListTodo } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

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
      <FormHeader icon={<ListTodo className="size-4" />} title="Add task" />

      <TaskForm />

      <FormFooter
        onCancel={closeAll}
        submitLabel="Add task"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  );
};

export default TaskCreateModal;
