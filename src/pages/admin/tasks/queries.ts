import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useTaskModalStore } from "./hooks/useTaskModalStore"
import { fetchTasks, createTask, updateTask, deleteTask } from "./api"
import type { CreateTaskPayload, UpdateTaskPayload } from "./types"

export function useTasksQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.tasks(slug!),
    queryFn: () => fetchTasks(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useTaskMutations() {
  const { slug } = useAdminStore()
  const closeAll = useTaskModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.tasks(slug!) })

  const create = useMutation(
    (payload: CreateTaskPayload) => createTask(payload),
    {
      successMessage: "Task added",
      errorMessage: "Failed to add task",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const update = useMutation(
    (payload: UpdateTaskPayload) => updateTask(payload),
    {
      successMessage: "Task updated",
      errorMessage: "Failed to update task",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const remove = useMutation(
    (id: string) => deleteTask(id),
    {
      successMessage: "Task deleted",
      errorMessage: "Failed to delete task",
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  return { create, update, remove }
}
