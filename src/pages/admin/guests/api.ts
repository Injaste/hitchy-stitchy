import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { supabase } from "@/lib/supabase"
import type {
  Guest,
  GuestFormValues,
  UpdateGuestPayload,
  CreateGuestPayload,
  GuestStatus,
  ImportResult,
} from "./types"

const GUEST_FIELDS =
  "id, event_id, name, phone, guest_count, message, status, source, invite_code, created_at, updated_at, confirmed_at, cancelled_at"

export async function fetchGuests(eventId: string): Promise<Guest[]> {
  const { data, error } = await supabase
    .from("event_rsvps")
    .select(GUEST_FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Guest[]
}

export async function createGuests(
  eventId: string,
  guests: CreateGuestPayload[],
): Promise<Guest[]> {
  const { data, error } = await supabase.rpc("create_guests", {
    p_event_id: eventId,
    p_guests: guests,
  })

  if (error) throw new Error(error.message)
  return (data ?? []) as Guest[]
}

export async function updateGuest(payload: UpdateGuestPayload): Promise<Guest> {
  const { data, error } = await supabase.rpc("update_guest", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_name: payload.name.trim(),
    p_phone: payload.phone?.trim() || null,
    p_guest_count: payload.guest_count,
    p_message: payload.message,
    p_status: payload.status,
    p_invite_code: payload.invite_code,
  })

  if (error) throw new Error(error.message)
  return data as Guest
}

export async function updateGuests(
  eventId: string,
  ids: string[],
  status: GuestStatus,
): Promise<Guest[]> {
  const { data, error } = await supabase.rpc("update_guests", {
    p_event_id: eventId,
    p_ids: ids,
    p_status: status,
  })

  if (error) throw new Error(error.message)
  return (data ?? []) as Guest[]
}

export async function deleteGuest(eventId: string, id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_guest", {
    p_event_id: eventId,
    p_id: id,
  })

  if (error) throw new Error(error.message)
}

/**
 * Mixed import: batch-inserts new rows via create_guests, then
 * updates conflict-resolved rows individually via update_guest.
 * Preserves the existing status and invite_code on updates.
 * Never fails as a whole — per-row failures go into ImportResult.failed.
 */
export async function bulkImportGuests({
  eventId,
  insertRows,
  updateRows,
  skippedCount,
}: {
  eventId: string
  insertRows: GuestFormValues[]
  updateRows: Array<{ guest: Guest; values: GuestFormValues }>
  skippedCount: number
}): Promise<ImportResult> {
  const result: ImportResult = {
    inserted: 0,
    updated: 0,
    skipped: skippedCount,
    failed: [],
  }

  if (insertRows.length > 0) {
    const guests: CreateGuestPayload[] = insertRows.map((r) => ({
      name: r.name.trim(),
      phone: r.phone?.trim() || null,
      guest_count: r.guest_count,
      message: r.message,
      status: r.status,
    }))

    try {
      const data = await createGuests(eventId, guests)
      result.inserted = data.length
    } catch (err) {
      insertRows.forEach((_, i) => {
        result.failed.push({ rowIndex: i + 1, reason: (err as Error).message })
      })
    }
  }

  for (const { guest, values } of updateRows) {
    try {
      await updateGuest({
        event_id: eventId,
        id: guest.id,
        name: values.name,
        phone: values.phone,
        guest_count: values.guest_count,
        message: values.message,
        status: guest.status,
        invite_code: guest.invite_code,
      })
      result.updated += 1
    } catch (err) {
      result.failed.push({ rowIndex: -1, reason: `${values.name}: ${(err as Error).message}` })
    }
  }

  return result
}

// TODO LATER import guest should be smart and check for already exising phone numbers and display in a new upload bulk guest modal, to identify new ones and what will be updated
// TODO TO ALSO UPDATE AND ENSURE THE SYSTEM IS SMART TO UNDERSTAND WHAT TO UPDATE AND WHAT TO INSERT

export function subscribeToGuests(
  eventId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
): () => void {
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
      onChange,
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}