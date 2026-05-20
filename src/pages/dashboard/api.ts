import { supabase } from "@/lib/supabase"
import type { Event, ClaimInvitePayload } from "./types"

export async function fetchUserEvents(): Promise<Event[]> {
  const { data, error } = await supabase.rpc("get_user_events")

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function claimInvite(payload: ClaimInvitePayload): Promise<void> {
  const { error } = await supabase.rpc("claim_member_invite", {
    p_event_id: payload.event_id,
    p_action: payload.action,
  })
  if (error) throw new Error(error.message)
}