import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { fetchTasks, fetchTaskOrder, saveTaskOrder, createTask, updateTask, deleteTask, archiveTasks, fetchArchivedTasks } from "./api"
import type { CreateTaskPayload, UpdateTaskPayload, DeleteTaskPayload, ArchiveTasksPayload, Task, TaskOrder } from "./types"
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

export function useArchivedTasksQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.archivedTasks(slug!),
    queryFn: () => fetchArchivedTasks(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useTaskMutations() {
  const { slug } = useAdminStore()
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.tasks(slug!) })
    queryClient.invalidateQueries({ queryKey: adminKeys.taskOrder(slug!) })
  }

  const setTasks = (fn: (old: Task[] | undefined) => Task[]) =>
    queryClient.setQueryData<Task[]>(adminKeys.tasks(slug!), fn)

  const setTaskOrder = (fn: (old: TaskOrder | undefined) => TaskOrder | undefined) =>
    queryClient.setQueryData<TaskOrder>(adminKeys.taskOrder(slug!), fn)

  const setArchived = (fn: (old: Task[] | undefined) => Task[]) =>
    queryClient.setQueryData<Task[]>(adminKeys.archivedTasks(slug!), fn)

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
      successMessage: (result: Task) => `"${truncate(result.title)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Task) => {
        setTasks((old) => old?.map((t) => t.id === result.id ? result : t) ?? [])
      },
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
        setArchived((old) => old?.filter((t) => t.id !== args.id) ?? [])
      },
    },
  )

  const archive = useMutation(
    (payload: ArchiveTasksPayload) => archiveTasks(payload),
    {
      successMessage: (_: void, args: ArchiveTasksPayload) => {
        const verb = args.archive ? "archived" : "restored"
        return args.ids.length === 1
          ? `"${truncate(args.label)}" ${verb}`
          : `${args.ids.length} tasks ${verb}`
      },
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: ArchiveTasksPayload) => {
        const idSet = new Set(args.ids)

        if (args.archive) {
          setTasks((old) => old?.filter((t) => !idSet.has(t.id)) ?? [])
          setTaskOrder((old) => {
            if (!old) return old
            return {
              ...old,
              todo: old.todo.filter((id) => !idSet.has(id)),
              in_progress: old.in_progress.filter((id) => !idSet.has(id)),
              done: old.done.filter((id) => !idSet.has(id)),
            }
          })
          queryClient.invalidateQueries({ queryKey: adminKeys.archivedTasks(slug!) })
        } else {
          setArchived((old) => old?.filter((t) => !idSet.has(t.id)) ?? [])
          invalidate()
        }
      },
    },
  )

  const saveStatuses = useMutation(
    (payload: UpdateTaskPayload) => updateTask(payload),
    {
      successMessage: (result: Task) =>
        `"${truncate(result.title)}" moved to ${STATUS_LABELS[result.status]}`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Task) => {
        setTasks((old) => old?.map((t) => t.id === result.id ? result : t) ?? [])
      },
      onError: () => invalidate(),
    },
  )

  return { create, update, remove, archive, saveOrder, saveStatuses }
}
