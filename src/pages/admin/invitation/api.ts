import { supabase } from "@/lib/supabase"
import type { EventInvitation, UpdateInvitationPayload } from "./types"

const FIELDS = "id, event_id, couple_names, event_date, event_time_start, event_time_end, venue_name, venue_address, venue_map_embed_url, venue_map_link, rsvp_mode, rsvp_deadline, config, created_at, updated_at"

export async function fetchInvitation(eventId: string): Promise<EventInvitation> {
  const { data, error } = await supabase
    .from("event_invitation")
    .select(FIELDS)
    .eq("event_id", eventId)
    .single()

  if (error) throw new Error(error.message)
  return data as EventInvitation
}

export async function updateInvitation({ event_id, ...fields }: UpdateInvitationPayload): Promise<void> {
  const { error } = await supabase
    .from("event_invitation")
    .update(fields)
    .eq("event_id", event_id)

  if (error) throw new Error(error.message)
}
