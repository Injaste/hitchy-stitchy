import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useMutation } from "@/lib/query/useMutation"
import { supabase } from "@/lib/supabase"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"

import {
  fetchGuests,
  createGuest,
  updateGuest,
  updateGuestStatus,
  deleteGuest,
  bulkImportGuests,
} from "./api"
import { useGuestModalStore } from "./hooks/useGuestModalStore"
import type {
  CreateGuestPayload,
  UpdateGuestPayload,
  GuestStatus,
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
  const { slug } = useAdminStore()
  const closeAll = useGuestModalStore((s) => s.closeAll)
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.guests(slug!) })
  }

  const create = useMutation(
    (payload: CreateGuestPayload) => createGuest(payload),
    {
      successMessage: "Guest added",
      errorMessage: "Failed to add guest",
      onSuccess: () => {
        invalidate()
        closeAll()
      },
    },
  )

  const update = useMutation(
    (payload: UpdateGuestPayload) => updateGuest(payload),
    {
      successMessage: "Guest updated",
      errorMessage: "Failed to update guest",
      onSuccess: () => {
        invalidate()
        closeAll()
      },
    },
  )

  const updateStatus = useMutation(
    (payload: { id: string; status: GuestStatus }) => updateGuestStatus(payload),
    {
      successMessage: "Status updated",
      errorMessage: "Failed to update status",
      onSuccess: () => invalidate(),
    },
  )

  const remove = useMutation((id: string) => deleteGuest(id), {
    successMessage: "Guest removed",
    errorMessage: "Failed to remove guest",
    onSuccess: () => {
      invalidate()
      closeAll()
    },
  })

  const bulkImport = useMutation(
    (payload: {
      eventId: string
      insertRows: GuestFormValues[]
      updateRows: Array<{ id: string; values: GuestFormValues }>
      skippedCount: number
    }) => bulkImportGuests(payload),
    {
      toast: {
        loading: "Importing guests…",
        success: (r: ImportResult) =>
          `${r.inserted} added · ${r.updated} updated · ${r.skipped} skipped`,
        error: "Import failed",
      },
      onSuccess: () => invalidate(),
    },
  )

  return { create, update, updateStatus, remove, bulkImport }
}
