import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"

import {
  fetchGuests,
  createGuest,
  updateGuest,
  updateGuests,
  deleteGuest,
  subscribeToGuests,
} from "./api"
import type {
  CreateGuestPayload,
  UpdateGuestPayload,
  GuestStatus,
  Guest,
} from "./types"
import { STATUS_LABELS } from "./types"
import { truncate } from "@/lib/utils"

export function useGuestsQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.guests(slug!),
    queryFn: () => fetchGuests(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useGuestsRealtime() {
  const { slug, eventId } = useAdminStore()
  const qc = useQueryClient()

  useEffect(() => {
    if (!eventId || !slug) return

    const unsubscribe = subscribeToGuests(eventId, (payload) => {
      qc.setQueryData<Guest[]>(adminKeys.guests(slug), (old) => {
        // Not loaded yet — let the initial query handle it.
        if (!old) return old

        if (payload.eventType === "DELETE") {
          const id = (payload.old as Partial<Guest>).id
          return id ? old.filter((g) => g.id !== id) : old
        }

        // INSERT/UPDATE: upsert by id. Replacing in place dedupes the
        // echo of our own optimistic write; genuinely new rows (e.g. a
        // public RSVP) prepend to match the created_at-desc fetch order.
        const row = payload.new as unknown as Guest
        return old.some((g) => g.id === row.id)
          ? old.map((g) => (g.id === row.id ? row : g))
          : [row, ...old]
      })
    })

    return unsubscribe
  }, [eventId, slug, qc])
}

export function useGuestMutations() {
  const { slug, eventId } = useAdminStore()
  const queryClient = useQueryClient()

  const setGuests = (fn: (old: Guest[] | undefined) => Guest[]) =>
    queryClient.setQueryData<Guest[]>(adminKeys.guests(slug!), fn)

  const create = useMutation(
    (payload: CreateGuestPayload & { invitationIds: string[] }) =>
      createGuest(eventId!, payload.invitationIds, payload),
    {
      successMessage: (rows: Guest[]) =>
        rows.length === 1
          ? `"${truncate(rows[0].name)}" added`
          : `"${truncate(rows[0]?.name ?? "Guest")}" added to ${rows.length} pages`,
      errorMessage: (err) => err.message,
      onSuccess: (rows: Guest[]) => {
        setGuests((old) => [...rows, ...(old ?? [])])
      },
    },
  )

  const update = useMutation(
    (payload: UpdateGuestPayload) => updateGuest(payload),
    {
      successMessage: (result: Guest) => `"${truncate(result.name)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Guest) => {
        setGuests((old) => old?.map((g) => g.id === result.id ? result : g) ?? [])
      },
    },
  )

  const updateStatus = useMutation(
    ({ guest, status }: { guest: Guest; status: GuestStatus }) =>
      updateGuest({
        event_id: guest.event_id,
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        guest_count: guest.guest_count,
        message: guest.message,
        status,
      }),
    {
      successMessage: (result: Guest) =>
        `"${truncate(result.name)}" marked ${STATUS_LABELS[result.status].toLowerCase()}`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Guest) => {
        setGuests((old) => old?.map((g) => g.id === result.id ? result : g) ?? [])
      },
    },
  )

  // prevStatuses is client-only (never reaches the RPC) — each affected
  // guest's status *before* this call, captured by the caller from the
  // current cache. Present only on the original bulk action; the undo
  // call(s) below omit it, which is what keeps the restore toast plain
  // (no undo-of-undo, matching the L5 pattern from task archive/restore).
  const bulkUpdateGuests = useMutation<
    { ids: string[]; status: GuestStatus; prevStatuses?: Record<string, GuestStatus> },
    Guest[]
  >(
    ({ ids, status }) => updateGuests(eventId!, ids, status),
    {
      successMessage: (rows: Guest[], args) => {
        const label = STATUS_LABELS[args.status].toLowerCase()
        return rows.length === 1
          ? `"${truncate(rows[0].name)}" marked ${label}`
          : `${rows.length} guests marked ${label}`
      },
      errorMessage: (err) => err.message,
      // A bulk change can sweep up guests that had different prior statuses —
      // undo has to send each back to its OWN previous status, not one shared
      // value, so it regroups by prevStatuses into one RPC call per group.
      // Those calls go straight through the API (not bulkUpdateGuests.mutate),
      // so the wrapper's own toast doesn't fire per group — one summary toast
      // covers the whole undo instead, matching the single toast the original
      // bulk action got.
      onUndo: (_rows, args) => {
        if (!args.prevStatuses) return undefined
        const groups = new Map<GuestStatus, string[]>()
        for (const id of args.ids) {
          const prev = args.prevStatuses[id]
          if (!prev) continue
          groups.set(prev, [...(groups.get(prev) ?? []), id])
        }
        return async () => {
          try {
            const results = await Promise.all(
              Array.from(groups, ([status, ids]) => updateGuests(eventId!, ids, status)),
            )
            const rows = results.flat()
            const byId = new Map(rows.map((r) => [r.id, r]))
            setGuests((old) => old?.map((g) => byId.get(g.id) ?? g) ?? [])
            toast.success(
              rows.length === 1
                ? `"${truncate(rows[0].name)}" restored`
                : `${rows.length} guests restored`,
            )
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't undo the status change")
          }
        }
      },
      onSuccess: (rows: Guest[]) => {
        const byId = new Map(rows.map((r) => [r.id, r]))
        setGuests((old) => old?.map((g) => byId.get(g.id) ?? g) ?? [])
      },
    },
  )

  const remove = useMutation(
    ({ id }: { id: string; name: string }) => deleteGuest(eventId!, id),
    {
      successMessage: (_: void, args) => `"${truncate(args.name)}" removed`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args) => {
        setGuests((old) => old?.filter((g) => g.id !== args.id) ?? [])
      },
    },
  )

  return { create, update, updateStatus, bulkUpdateGuests, remove }
}
