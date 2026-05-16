import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useMutation } from "@/lib/query/useMutation"
import { supabase } from "@/lib/supabase"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"

import {
  fetchGuests,
  createGuests,
  updateGuest,
  deleteGuest,
  bulkImportGuests,
} from "./api"
import { useGuestModalStore } from "./hooks/useGuestModalStore"
import type {
  CreateGuestPayload,
  UpdateGuestPayload,
  GuestStatus,
  Guest,
  GuestFormValues,
  ImportResult,
} from "./types"

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

    const channel = supabase
      .channel(`admin-guests-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: adminKeys.guests(slug) })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, slug, qc])
}

export function useGuestMutations() {
  const { slug, eventId } = useAdminStore()
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const setGuests = (fn: (old: Guest[] | undefined) => Guest[]) =>
    queryClient.setQueryData<Guest[]>(adminKeys.guests(slug!), fn)

  const create = useMutation(
    async (payload: CreateGuestPayload) => {
      const [row] = await createGuests(eventId!, [{
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        guest_count: payload.guest_count,
        message: payload.message,
        status: payload.status,
      }])
      return row
    },
    {
      successMessage: "Guest added",
      errorMessage: (err) => err.message,
      onSuccess: (result: Guest) => {
        setGuests((old) => [result, ...(old ?? [])])
      },
    },
  )

  const update = useMutation(
    (payload: UpdateGuestPayload) => updateGuest(payload),
    {
      successMessage: "Guest updated",
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
        invite_code: guest.invite_code,
      }),
    {
      successMessage: "Status updated",
      errorMessage: (err) => err.message,
      onSuccess: (result: Guest) => {
        setGuests((old) => old?.map((g) => g.id === result.id ? result : g) ?? [])
      },
    },
  )

  const remove = useMutation(
    (id: string) => deleteGuest(eventId!, id),
    {
      successMessage: "Guest removed",
      errorMessage: (err) => err.message,
      onSuccess: (_: void, id: string) => {
        setGuests((old) => old?.filter((g) => g.id !== id) ?? [])
        closeAll()
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

  return { create, update, updateStatus, remove, bulkImport }
}

/*
TODO FIX UP REALTIME UPDATES ON GUESTS
*/
