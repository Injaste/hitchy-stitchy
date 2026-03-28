import { useQuery } from "@/lib/query/useQuery";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { getTasks, createTask, updateTask, deleteTask } from "./api";
import type { ChecklistItem } from "./types";

export function useTasks() {
  return useQuery(getTasks, { key: "tasks" });
}

export function useTaskMutations() {
  const { tasks, setTasks } = useAdminStore();
  const { closeTaskModal } = useModalStore();

  const create = useMutation(
    (task: Omit<ChecklistItem, "id">) => createTask(task),
    {
      successMessage: "Task created",
      errorMessage: "Failed to create task",
      onSuccess: (newTask) => {
        setTasks([...tasks, newTask]);
        closeTaskModal();
      },
    }
  );

  const update = useMutation(
    (task: ChecklistItem) => updateTask(task),
    {
      successMessage: "Task updated",
      errorMessage: "Failed to update task",
      onSuccess: (updated) => {
        setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
        closeTaskModal();
      },
    }
  );

  const remove = useMutation(
    (id: string) => deleteTask(id),
    {
      successMessage: "Task deleted",
      errorMessage: "Failed to delete task",
      onSuccess: (id) => {
        setTasks(tasks.filter((t) => t.id !== id));
      },
    }
  );

  return { create, update, remove };
}
