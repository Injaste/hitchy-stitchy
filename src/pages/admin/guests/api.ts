import { supabase } from "@/lib/supabase"
import type {
  Guest,
  GuestFormValues,
  GuestStatus,
  CreateGuestPayload,
  UpdateGuestPayload,
  ImportResult,
} from "./types"

const GUEST_FIELDS =
  "id, event_id, name, phone, guest_count, message, status, source, cancel_token, created_at, updated_at"

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
  const { data, error } = await supabase
    .from("event_rsvps")
    .insert({
      event_id: payload.event_id,
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      guest_count: payload.guest_count,
      message: payload.message,
      status: "pending",
      source: "pool",
    })
    .select(GUEST_FIELDS)
    .single()

  if (error) throw new Error(error.message)
  return data as Guest
}

export async function updateGuest(payload: UpdateGuestPayload): Promise<void> {
  const { id, name, phone, guest_count, message } = payload
  const { error } = await supabase
    .from("event_rsvps")
    .update({
      name: name.trim(),
      phone: phone.trim(),
      guest_count,
      message,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function updateGuestStatus({
  id,
  status,
}: {
  id: string
  status: GuestStatus
}): Promise<void> {
  const { error } = await supabase
    .from("event_rsvps")
    .update({ status })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function deleteGuest(id: string): Promise<void> {
  const { error } = await supabase.from("event_rsvps").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

/**
 * Runs a mixed import in two batches: insert all new rows first, then per-row
 * update for conflict-resolved rows. Never fails as a whole — collects per-row
 * failures into `ImportResult.failed` so the user sees exactly what landed and
 * what didn't. Inserts always force `source: 'pool'`, `status: 'pending'`.
 */
export async function bulkImportGuests({
  eventId,
  insertRows,
  updateRows,
  skippedCount,
}: {
  eventId: string
  insertRows: GuestFormValues[]
  updateRows: Array<{ id: string; values: GuestFormValues }>
  skippedCount: number
}): Promise<ImportResult> {
  const result: ImportResult = {
    inserted: 0,
    updated: 0,
    skipped: skippedCount,
    failed: [],
  }

  if (insertRows.length > 0) {
    const rows = insertRows.map((r) => ({
      event_id: eventId,
      name: r.name.trim(),
      phone: r.phone.trim(),
      guest_count: r.guest_count,
      message: r.message,
      status: "pending" as const,
      source: "pool" as const,
    }))

    const { data, error } = await supabase
      .from("event_rsvps")
      .insert(rows)
      .select("id")

    if (error) {
      // Insert is all-or-nothing in Supabase — surface each row as failed.
      insertRows.forEach((_, i) => {
        result.failed.push({ rowIndex: i + 1, reason: error.message })
      })
    } else {
      result.inserted = data?.length ?? rows.length
    }
  }

  for (const { id, values } of updateRows) {
    const { error } = await supabase
      .from("event_rsvps")
      .update({
        name: values.name.trim(),
        phone: values.phone.trim(),
        guest_count: values.guest_count,
        message: values.message,
      })
      .eq("id", id)

    if (error) {
      result.failed.push({ rowIndex: -1, reason: `${values.name}: ${error.message}` })
    } else {
      result.updated += 1
    }
  }

  return result
}
