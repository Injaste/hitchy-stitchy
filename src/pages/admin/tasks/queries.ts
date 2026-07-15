import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { fetchTasks, createTask, updateTask, deleteTask, archiveTasks, fetchArchivedTasks, moveTask, subscribeToTasks } from "./api"
import { useCardFly } from "./hooks/useCardFly"
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

// Live-syncs the board with event_tasks changes from other clients. Patches the
// tasks cache directly (mirrors the mutations' optimistic writes, so our own
// echoes dedupe by id).
export function useTasksRealtime() {
  const { slug, eventId } = useAdminStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!eventId || !slug) return

    const unsubscribe = subscribeToTasks(eventId, (payload) => {
      const fly = useCardFly.getState()
      let flyingId: string | null = null

      // A status change from another client moves the card to a new column — fly
      // it across, mirroring a local toggle. We compare against the *cached*
      // status (not payload.old, which carries only the id) so we skip non-status
      // edits and the echo of our own optimistic write, which is already applied.
      // The `!fly.flights` guard covers the race where our echo beats the RPC
      // response — the local flight is still airborne, so don't start a rival.
      // takeOff must run before the patch (to snapshot the old column); land runs
      // after (to fly to the new one).
      if (payload.eventType === "UPDATE") {
        const row = payload.new as unknown as Task
        const prev = queryClient
          .getQueryData<Task[]>(adminKeys.tasks(slug))
          ?.find((t) => t.id === row.id)
        if (prev && !row.archived_at && prev.status !== row.status && !fly.flights[row.id]) {
          fly.takeOff(row.id, "success")
          flyingId = row.id
        }
      }

      queryClient.setQueryData<Task[]>(adminKeys.tasks(slug), (old) => {
        if (!old) return old

        if (payload.eventType === "DELETE") {
          const id = (payload.old as Partial<Task>).id
          return id ? old.filter((t) => t.id !== id) : old
        }

        const row = payload.new as unknown as Task
        // An archive sets archived_at; fetchTasks excludes those rows, so drop
        // it from the board rather than upserting an archived task.
        if (row.archived_at) return old.filter((t) => t.id !== row.id)

        // INSERT/UPDATE: upsert by id; new rows append and TasksView sorts by
        // position.
        return old.some((t) => t.id === row.id)
          ? old.map((t) => (t.id === row.id ? row : t))
          : [...old, row]
      })

      // Keep the archived sheet in step with archive/restore/delete from other
      // clients (only refetches while the sheet is open).
      queryClient.invalidateQueries({ queryKey: adminKeys.archivedTasks(slug) })

      if (flyingId) fly.land(flyingId)
    })

    return unsubscribe
  }, [eventId, slug, queryClient])
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
