import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { fetchTasks, createTask, updateTask, deleteTask, archiveTasks, fetchArchivedTasks, moveTask } from "./api"
import type { CreateTaskPayload, UpdateTaskPayload, DeleteTaskPayload, ArchiveTasksPayload, MoveTaskPayload, Task } from "./types"
import { truncate } from "@/lib/utils"

export function useTasksQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.tasks(slug!),
    queryFn: () => fetchTasks(eventId!),
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

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.tasks(slug!) })

  const setTasks = (fn: (old: Task[] | undefined) => Task[]) =>
    queryClient.setQueryData<Task[]>(adminKeys.tasks(slug!), fn)

  const setArchived = (fn: (old: Task[] | undefined) => Task[]) =>
    queryClient.setQueryData<Task[]>(adminKeys.archivedTasks(slug!), fn)

  const create = useMutation(
    (payload: CreateTaskPayload) => createTask(payload),
    {
      successMessage: (result: Task) => `"${truncate(result.title)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Task) => {
        setTasks((old) => [...(old ?? []), result])
      },
    },
  )

  const update = useMutation(
    (payload: UpdateTaskPayload) => updateTask(payload),
    {
      successMessage: (result: Task) => `"${truncate(result.title)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Task) => {
        setTasks((old) => old?.map((t) => (t.id === result.id ? result : t)) ?? [])
      },
    },
  )

  // Drag reorder — silent. useTaskDnd patches the cache optimistically; we
  // reconcile with the returned row. move_task is gated tasks:update.
  // Drag reorder — silent + optimistic (see useTaskDnd). The drop itself is the
  // animation; on error the call site reverts and flies the card back.
  const move = useMutation(
    (payload: MoveTaskPayload) => moveTask(payload),
    {
      silent: true,
      onSuccess: (result: Task) => {
        setTasks((old) => old?.map((t) => (t.id === result.id ? result : t)) ?? [])
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
          queryClient.invalidateQueries({ queryKey: adminKeys.archivedTasks(slug!) })
        } else {
          setArchived((old) => old?.filter((t) => !idSet.has(t.id)) ?? [])
          invalidate()
        }
      },
    },
  )

  return { create, update, remove, archive, move }
}
