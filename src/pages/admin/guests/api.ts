import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import { supabase } from "@/lib/supabase"
import type {
  Guest,
  UpdateGuestPayload,
  CreateGuestPayload,
  ImportGuestPayload,
  GuestStatus,
} from "./types"

const GUEST_FIELDS =
  "id, event_id, invitation_id, name, phone, guest_count, message, status, created_at, updated_at, confirmed_at, cancelled_at"

export async function fetchGuests(eventId: string): Promise<Guest[]> {
  const { data, error } = await supabase
    .from("event_rsvps")
    .select(GUEST_FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Guest[]
}

// Add one guest to one or more invitation pages, atomically (create_guest —
// all-or-nothing; plan cap + per-page bounds + phone-dedup). Returns the created rows.
export async function createGuest(
  eventId: string,
  invitationIds: string[],
  guest: CreateGuestPayload,
): Promise<Guest[]> {
  const { data, error } = await supabase.rpc("create_guest", {
    p_event_id: eventId,
    p_invitation_ids: invitationIds,
    p_guest: {
      name: guest.name.trim(),
      phone: guest.phone?.trim() || null,
      guest_count: guest.guest_count,
      message: guest.message,
      status: guest.status,
    },
  })

  if (error) throw new Error(error.message)
  return (data ?? []) as Guest[]
}

// Import a whole batch onto one or more invitation pages in a single call
// (import_guests — all-or-nothing; ONE plan check over the batch total before
// any row is written, so an over-cap import writes nothing). Guests whose phone
// already exists on a target page are SKIPPED rather than rejected, so the
// returned rows are the ones that actually landed — possibly fewer than sent.
export async function importGuests(
  eventId: string,
  invitationIds: string[],
  guests: ImportGuestPayload[],
): Promise<Guest[]> {
  const { data, error } = await supabase.rpc("import_guests", {
    p_event_id: eventId,
    p_invitation_ids: invitationIds,
    p_guests: guests.map((guest) => ({
      name: guest.name.trim(),
      phone: guest.phone?.trim() || null,
      guest_count: guest.guest_count,
      // Always explicit: an absent status defaults to 'confirmed' server-side
      // (matching create_guest), which spends the active guest cap immediately.
      status: guest.status,
      message: guest.message,
    })),
  })

  if (error) throw new Error(error.message)
  return (data ?? []) as Guest[]
}

// Per-(day, segment) model: limits come from the guest's own invitation page.
export async function updateGuest(payload: UpdateGuestPayload): Promise<Guest> {
  const { data, error } = await supabase.rpc("update_guest", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_name: payload.name.trim(),
    p_phone: payload.phone?.trim() || null,
    p_guest_count: payload.guest_count,
    p_message: payload.message,
    p_status: payload.status,
    // Only sent on an actual page move — omitting it keeps the call compatible
    // with the pre-migration signature (named-param resolution).
    ...(payload.invitation_id != null
      ? { p_invitation_id: payload.invitation_id }
      : {}),
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

export async function deleteGuests(eventId: string, ids: string[]): Promise<void> {
  const { error } = await supabase.rpc("delete_guests", {
    p_event_id: eventId,
    p_ids: ids,
  })

  if (error) throw new Error(error.message)
}

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