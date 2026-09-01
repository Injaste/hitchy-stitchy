import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"

import {
  fetchGuests,
  createGuest,
  importGuests as importGuestsApi,
  updateGuest,
  updateGuests,
  deleteGuests,
  subscribeToGuests,
} from "./api"
import type {
  CreateGuestPayload,
  ImportGuestPayload,
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

  // A whole pasted/uploaded list in one call. import_guests skips guests whose
  // phone is already on a target page instead of failing, so it returns only the
  // rows that actually landed — an all-duplicate batch is an empty success, not
  // an error.
  const importGuests = useMutation<
    { invitationIds: string[]; guests: ImportGuestPayload[] },
    Guest[]
  >(
    ({ invitationIds, guests }) => importGuestsApi(eventId!, invitationIds, guests),
    {
      successMessage: (rows: Guest[], args) =>
        rows.length === 0
          ? "Everyone on that list is already on your guest list"
          : args.invitationIds.length > 1
            ? `${rows.length} guests added across ${args.invitationIds.length} pages`
            : `${rows.length} guests added`,
      errorMessage: (err) => err.message,
      onSuccess: (rows: Guest[]) => {
        setGuests((old) => [...rows, ...(old ?? [])])
      },
    },
  )

  // Bulk page assignment. Additive: every guest is written to the target pages
  // it isn't already on, which is why the call arrives pre-split into batches —
  // import_guests applies one guest list to one page list, so guests that need
  // different pages can't share a call. The batches run one after another, NOT
  // in parallel: each call's plan check only sees rows that are already
  // committed, so concurrent batches would each be measured against the same
  // pre-assignment usage and could land the selection over the cap between them.
  // Removal (the "move" half) runs only after the additive half lands in full,
  // so a failure can't leave a guest on no page.
  const assignGuestPages = useMutation<
    {
      batches: { invitationIds: string[]; guests: ImportGuestPayload[] }[]
      removeIds: string[]
      /** Guests the sheet acted on, and pages picked — for the toast only. */
      guestCount: number
      pageCount: number
    },
    { added: Guest[]; removed: string[] }
  >(
    async ({ batches, removeIds }) => {
      const added: Guest[] = []
      let failedGuests = 0
      let firstError: Error | undefined

      for (const batch of batches) {
        try {
          added.push(
            ...(await importGuestsApi(eventId!, batch.invitationIds, batch.guests)),
          )
        } catch (err) {
          failedGuests += batch.guests.length
          firstError ??=
            err instanceof Error ? err : new Error("Couldn't add those guests")
        }
      }

      // A partly-written assignment is a failure, not a success with a footnote:
      // it takes the error toast's length and close button, and leaves the sheet
      // (and the selection) open to retry. Rows that DID land are real, so the
      // cache takes them before the throw or the table would deny they exist.
      if (failedGuests > 0) {
        if (added.length > 0) setGuests((old) => [...added, ...(old ?? [])])
        const detail = firstError?.message ?? "Couldn't add those guests"
        throw new Error(
          added.length > 0
            ? `${added.length} added, ${failedGuests} couldn't be: ${detail}`
            : detail,
        )
      }

      let removed: string[] = []
      if (removeIds.length > 0) {
        await deleteGuests(eventId!, removeIds)
        removed = removeIds
      }

      return { added, removed }
    },
    {
      successMessage: (result, args) => {
        const pages = `${args.pageCount} ${args.pageCount === 1 ? "page" : "pages"}`
        if (result.removed.length > 0)
          return `${args.guestCount} guests moved to ${pages}`
        return result.added.length === 0
          ? "Those guests are already on the pages you picked"
          : `${result.added.length} guests added to ${pages}`
      },
      errorMessage: (err) => err.message,
      onSuccess: (result) => {
        const removedIds = new Set(result.removed)
        setGuests((old) => [
          ...result.added,
          ...(old ?? []).filter((g) => !removedIds.has(g.id)),
        ])
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
        // allSettled, not all: one failing group must not throw away the groups
        // that already succeeded — those rows are changed on the server, so the
        // cache has to show them or the table lies about the current status.
        return async () => {
          const entries = Array.from(groups)
          const results = await Promise.allSettled(
            entries.map(([status, ids]) => updateGuests(eventId!, ids, status)),
          )
          const rows = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
          if (rows.length > 0) {
            const byId = new Map(rows.map((r) => [r.id, r]))
            setGuests((old) => old?.map((g) => byId.get(g.id) ?? g) ?? [])
          }

          const missed = results.reduce(
            (n, r, i) => (r.status === "rejected" ? n + entries[i][1].length : n),
            0,
          )
          // Still exactly one toast per undo, whatever the outcome.
          if (missed === 0) {
            toast.success(
              rows.length === 1
                ? `"${truncate(rows[0].name)}" restored`
                : `${rows.length} guests restored`,
            )
          } else if (rows.length === 0) {
            const reason = results.find((r) => r.status === "rejected")
            const err = (reason as PromiseRejectedResult | undefined)?.reason
            toast.error(
              err instanceof Error ? err.message : "Couldn't undo the status change",
            )
          } else {
            toast.error(
              `${rows.length} guests restored. ${missed} couldn't be changed back.`,
            )
          }
        }
      },
      onSuccess: (rows: Guest[]) => {
        const byId = new Map(rows.map((r) => [r.id, r]))
        setGuests((old) => old?.map((g) => byId.get(g.id) ?? g) ?? [])
      },
    },
  )

  // One RPC (delete_guests) backs both single and bulk delete — GuestDeleteModal
  // resolves the target ids for either path and calls this the same way.
  const remove = useMutation(
    ({ ids }: { ids: string[]; name?: string }) => deleteGuests(eventId!, ids),
    {
      successMessage: (_: void, args) =>
        args.ids.length === 1 && args.name
          ? `"${truncate(args.name)}" removed`
          : `${args.ids.length} guests removed`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args) => {
        const idSet = new Set(args.ids)
        setGuests((old) => old?.filter((g) => !idSet.has(g.id)) ?? [])
      },
    },
  )

  return {
    create,
    importGuests,
    assignGuestPages,
    update,
    updateStatus,
    bulkUpdateGuests,
    remove,
  }
}
