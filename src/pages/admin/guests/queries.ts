import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"

import {
  fetchGuests,
  createGuestsV2,
  updateGuestV2,
  updateGuests,
  deleteGuest,
  bulkImportGuests,
  subscribeToGuests,
} from "./api"
import type {
  CreateGuestPayload,
  UpdateGuestPayload,
  GuestStatus,
  Guest,
  GuestFormValues,
  ImportResult,
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
    async (payload: CreateGuestPayload & { invitationId: string }) => {
      const [row] = await createGuestsV2(eventId!, payload.invitationId, [{
        name: payload.name.trim(),
        phone: payload.phone?.trim() || null,
        guest_count: payload.guest_count,
        message: payload.message,
        status: payload.status,
      }])
      return row
    },
    {
      successMessage: (result: Guest) => `"${truncate(result.name)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Guest) => {
        setGuests((old) => [result, ...(old ?? [])])
      },
    },
  )

  const update = useMutation(
    (payload: UpdateGuestPayload) => updateGuestV2(payload),
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
      updateGuestV2({
        event_id: guest.event_id,
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        guest_count: guest.guest_count,
        message: guest.message,
        status,
        invite_code: guest.invite_code,
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

  const bulkUpdateGuests = useMutation(
    ({ ids, status }: { ids: string[]; status: GuestStatus }) =>
      updateGuests(eventId!, ids, status),
    {
      successMessage: (rows: Guest[], args) => {
        const label = STATUS_LABELS[args.status].toLowerCase()
        return rows.length === 1
          ? `"${truncate(rows[0].name)}" marked ${label}`
          : `${rows.length} guests marked ${label}`
      },
      errorMessage: (err) => err.message,
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

  const bulkImport = useMutation(
    (payload: {
      eventId: string
      insertRows: GuestFormValues[]
      updateRows: Array<{ guest: Guest; values: GuestFormValues }>
      skippedCount: number
    }) => bulkImportGuests(payload),
    {
      toast: {
        loading: "Importing guests…",
        success: (r: ImportResult) =>
          `${r.inserted} added · ${r.updated} updated · ${r.skipped} skipped`,
        error: "Import failed",
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.guests(slug!) })
      },
    },
  )

  return { create, update, updateStatus, bulkUpdateGuests, remove, bulkImport }
}
