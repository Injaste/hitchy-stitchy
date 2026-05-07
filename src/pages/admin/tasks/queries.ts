import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useTaskModalStore } from "./hooks/useTaskModalStore"
import { fetchTasks, fetchTaskOrder, saveTaskOrder, createTask, updateTask, deleteTask } from "./api"
import type { CreateTaskPayload, UpdateTaskPayload, DeleteTaskPayload, TaskOrder } from "./types"

export function useTasksQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.tasks(slug!),
    queryFn: () => fetchTasks(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useTaskOrderQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.taskOrder(slug!),
    queryFn: () => fetchTaskOrder(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useTaskMutations() {
  const { slug } = useAdminStore()
  const closeAll = useTaskModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.tasks(slug!) })
    queryClient.invalidateQueries({ queryKey: adminKeys.taskOrder(slug!) })
  }

  const create = useMutation(
    (payload: CreateTaskPayload) => createTask(payload),
    {
      successMessage: "Task added",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const update = useMutation(
    (payload: UpdateTaskPayload) => updateTask(payload),
    {
      successMessage: "Task updated",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const remove = useMutation(
    (payload: DeleteTaskPayload) => deleteTask(payload),
    {
      successMessage: "Task deleted",
      errorMessage: (err) => err.message,
      onSuccess: () => { invalidate(); closeAll() },
    },
  )

  const saveOrder = useMutation(
    (order: TaskOrder) => saveTaskOrder(order),
    {
      silent: true,
      onSuccess: () => invalidate(),
      onError: () => invalidate(),
    },
  )

  const saveStatuses = useMutation(
    (payload: UpdateTaskPayload) => updateTask(payload),
    {
      silent: true,
      onSuccess: () => invalidate(),
      onError: () => invalidate(),
    },
  )

  return { create, update, remove, saveOrder, saveStatuses }
}
