import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useTaskModalStore } from "./hooks/useTaskModalStore"
import { fetchTasks, fetchTaskOrder, saveTaskOrder, createTask, updateTask, deleteTask } from "./api"
import type { CreateTaskPayload, UpdateTaskPayload, TaskOrder } from "./types"

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

  const saveOrder = useMutation(
    (order: TaskOrder) => saveTaskOrder(order),
    {
      silent: true,
      onSuccess: () => invalidate(),
      onError: () => invalidate(),
    },
  )

  const saveStatuses = useMutation(
    async (payloads: UpdateTaskPayload[]) => {
      await Promise.all(payloads.map((p) => updateTask(p)))
    },
    {
      silent: true,
      onSuccess: () => invalidate(),
      onError: () => invalidate(),
    },
  )

  return { create, update, remove, saveOrder, saveStatuses }
}
