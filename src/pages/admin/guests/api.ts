import { supabase } from "@/lib/supabase"
import type {
  Guest,
  GuestFormValues,
  CreateGuestPayload,
  UpdateGuestPayload,
  ImportResult,
} from "./types"
import { delay } from "@/lib/utils"

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

export async function createGuest(payload: CreateGuestPayload): Promise<Guest> {

  await delay(1000);

  const { data, error } = await supabase.rpc("create_guest", {
    p_event_id: payload.event_id,
    p_name: payload.name.trim(),
    p_phone: payload.phone.trim(),
    p_guest_count: payload.guest_count,
    p_message: payload.message,
  })

  if (error) throw new Error(error.message)
  return data as Guest
}

export async function updateGuest(payload: UpdateGuestPayload): Promise<void> {
  const { error } = await supabase.rpc("update_guest", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_name: payload.name.trim(),
    p_phone: payload.phone.trim(),
    p_guest_count: payload.guest_count,
    p_message: payload.message,
    p_status: payload.status,
    p_invite_code: payload.invite_code,
  })

  if (error) throw new Error(error.message)
}

export async function deleteGuest(eventId: string, id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_guest", {
    p_event_id: eventId,
    p_id: id,
  })

  if (error) throw new Error(error.message)
}

/**
 * Mixed import: batch-inserts new rows via create_guest_batch, then
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
    const guests = insertRows.map((r) => ({
      name: r.name.trim(),
      phone: r.phone.trim(),
      guest_count: r.guest_count,
      message: r.message,
    }))

    const { data, error } = await supabase.rpc("create_guest_batch", {
      p_event_id: eventId,
      p_guests: guests,
    })

    if (error) {
      insertRows.forEach((_, i) => {
        result.failed.push({ rowIndex: i + 1, reason: error.message })
      })
    } else {
      result.inserted = Array.isArray(data) ? data.length : insertRows.length
    }
  }

  for (const { guest, values } of updateRows) {
    const { error } = await supabase.rpc("update_guest", {
      p_event_id: eventId,
      p_id: guest.id,
      p_name: values.name.trim(),
      p_phone: values.phone.trim(),
      p_guest_count: values.guest_count,
      p_message: values.message,
      p_status: guest.status,
      p_invite_code: guest.invite_code,
    })

    if (error) {
      result.failed.push({ rowIndex: -1, reason: `${values.name}: ${error.message}` })
    } else {
      result.updated += 1
    }
  }

  return result
}
