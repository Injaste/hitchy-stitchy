import { supabase } from "@/lib/supabase"
import type { Event, PendingInvite } from "./types"

export async function fetchUserEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, slug, name, date_start, date_end")
    .order("date_start", { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Requires RPC: get_pending_invites()
// Finds event_members rows where user_id IS NULL, rejected_at IS NULL,
// and email matches the authed user's email — runs as security definer.
export async function fetchPendingInvites(): Promise<PendingInvite[]> {
  const { data, error } = await supabase.rpc("get_pending_invites")
  if (error) throw new Error(error.message)
  return data ?? []
}

// Requires RPC: claim_member_invite(p_member_id)
// Sets user_id = auth.uid(), joined_at = now() — runs as security definer.
export async function acceptInvite(memberId: string): Promise<void> {
  const { error } = await supabase.rpc("claim_member_invite", {
    p_member_id: memberId,
  })
  if (error) throw new Error(error.message)
}

// Requires RPC: reject_member_invite(p_member_id)
// Sets rejected_at = now() — runs as security definer.
export async function rejectInvite(memberId: string): Promise<void> {
  const { error } = await supabase.rpc("reject_member_invite", {
    p_member_id: memberId,
  })
  if (error) throw new Error(error.message)
}