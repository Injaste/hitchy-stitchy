import { supabase } from "@/lib/supabase"
import type { RSVPEntry, RSVPStatus } from './types'

const FIELDS = "id, event_id, name, phone, guest_count, message, status, source, cancel_token, created_at, updated_at"

export async function fetchRSVPs(eventId: string): Promise<RSVPEntry[]> {
  const { data, error } = await supabase
    .from("event_rsvps")
    .select(FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as RSVPEntry[]
}

export async function updateRSVPStatus({ id, status }: { id: string; status: RSVPStatus }): Promise<void> {
  const { error } = await supabase
    .from("event_rsvps")
    .update({ status })
    .eq("id", id)

  if (error) throw new Error(error.message)
}
