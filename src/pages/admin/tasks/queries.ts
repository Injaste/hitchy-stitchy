import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useTaskModalStore } from "./hooks/useTaskModalStore"
import { fetchTasks, fetchTaskOrder, saveTaskOrder, createTask, updateTask, deleteTask } from "./api"
import type { CreateTaskPayload, UpdateTaskPayload, DeleteTaskPayload, Task, TaskOrder } from "./types"
import { STATUS_LABELS } from "./types"

const truncate = (title: string, max = 30) =>
  title.length > max ? `${title.slice(0, max)}…` : title

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

  const setTasks = (fn: (old: Task[] | undefined) => Task[]) =>
    queryClient.setQueryData<Task[]>(adminKeys.tasks(slug!), fn)

  const setTaskOrder = (fn: (old: TaskOrder | undefined) => TaskOrder | undefined) =>
    queryClient.setQueryData<TaskOrder>(adminKeys.taskOrder(slug!), fn)

  // defined first so create.onSuccess can reference it
  const saveOrder = useMutation(
    (order: TaskOrder) => saveTaskOrder(order),
    {
      silent: true,
      onSuccess: () => invalidate(),
      onError: () => invalidate(),
    },
  )

  const create = useMutation(
    (payload: CreateTaskPayload) => createTask(payload),
    {
      successMessage: (result: Task) => `"${truncate(result.title)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Task) => {
        setTasks((old) => [...(old ?? []), result])
        const newOrder = setTaskOrder((old) => {
          if (!old) return old
          return { ...old, [result.status]: [...(old[result.status] ?? []), result.id] }
        })
        if (newOrder) saveOrder.mutate(newOrder)
      },
    },
  )

  const update = useMutation(
    (payload: UpdateTaskPayload) => updateTask(payload),
    {
      successMessage: (_: void, args: UpdateTaskPayload) => `"${truncate(args.title)}" updated`,
      errorMessage: (err) => err.message,
      // invalidate: completed_at is set by a DB trigger — need the server value
      onSuccess: () => invalidate(),
    },
  )

  const remove = useMutation(
    (payload: DeleteTaskPayload) => deleteTask(payload),
    {
      successMessage: (_: void, args: DeleteTaskPayload) => `"${truncate(args.title)}" deleted`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: DeleteTaskPayload) => {
        setTasks((old) => old?.filter((t) => t.id !== args.id) ?? [])
        setTaskOrder((old) => {
          if (!old) return old
          return {
            ...old,
            todo: old.todo.filter((id) => id !== args.id),
            in_progress: old.in_progress.filter((id) => id !== args.id),
            done: old.done.filter((id) => id !== args.id),
          }
        })
        closeAll()
      },
    },
  )

  const saveStatuses = useMutation(
    (payload: UpdateTaskPayload) => updateTask(payload),
    {
      successMessage: (_: void, args: UpdateTaskPayload) =>
        `"${truncate(args.title)}" moved to ${STATUS_LABELS[args.status]}`,
      errorMessage: (err) => err.message,
      onSuccess: () => invalidate(),
      onError: () => invalidate(),
    },
  )

  return { create, update, remove, saveOrder, saveStatuses }
}
