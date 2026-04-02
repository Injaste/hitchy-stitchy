import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { useModalStore } from "@/pages/planner/store/useModalStore";
import { getTasks, createTask, updateTask, deleteTask } from "./api";
import type { ChecklistItem } from "./types";

export const tasksQueryKey = ["tasks"] as const;

export function useTasks() {
  return useQuery({
    queryKey: tasksQueryKey,
    queryFn: getTasks,
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const { closeTaskModal } = useModalStore();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: tasksQueryKey });

  const create = useMutation(
    (task: Omit<ChecklistItem, "id">) => createTask(task),
    {
      successMessage: "Task created",
      errorMessage: "Failed to create task",
      onSuccess: () => {
        invalidate();
        closeTaskModal();
      },
    }
  );

  const update = useMutation(
    (task: ChecklistItem) => updateTask(task),
    {
      successMessage: "Task updated",
      errorMessage: "Failed to update task",
      onSuccess: () => {
        invalidate();
        closeTaskModal();
      },
    }
  );

  const remove = useMutation(
    (id: string) => deleteTask(id),
    {
      successMessage: "Task deleted",
      errorMessage: "Failed to delete task",
      onSuccess: () => invalidate(),
    }
  );

  return { create, update, remove };
}