import { supabase } from "@/lib/supabase"
import { isRegenerateOnCooldown } from "./utils"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type {
  Member,
  CreateMemberPayload,
  UpdateMemberPayload,
  UpdateMemberAccessGroupPayload,
  UpdateMemberCouplePayload,
  FreezeMemberPayload,
  DeleteMemberPayload,
  RegenerateMemberInvitePayload,
} from "./types"

export async function fetchMembers(eventId: string): Promise<Member[]> {
  // Routed through an RPC so email is gated server-side (managers/superadmin only);
  // the email column is REVOKEd from direct selects.
  const { data, error } = await supabase.rpc("get_members", { p_event_id: eventId })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Member[]
}

export async function createMember(payload: CreateMemberPayload): Promise<Member> {
  const { data, error } = await supabase.rpc("create_member", {
    p_event_id: payload.event_id,
    p_display_name: payload.display_name,
    p_access_group_id: payload.access_group_id,
    p_role: payload.role,
    p_notes: payload.notes,
    p_couple: payload.couple,
  })

  if (error) throw new Error(error.message)
  return data as Member
}

export async function regenerateMemberInvite(payload: RegenerateMemberInvitePayload): Promise<Member> {
  // Mirror the RPC's 1-minute cooldown so a too-soon click fails instantly with
  // no round-trip. The server still enforces it — this is UX only.
  if (payload.invite_expires_at && isRegenerateOnCooldown(payload.invite_expires_at)) {
    throw new Error("Please wait a minute before regenerating this link")
  }

  const { data, error } = await supabase.rpc("regenerate_member_invite", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  })

  if (error) throw new Error(error.message)
  return data as Member
}

export async function updateMember(payload: UpdateMemberPayload): Promise<Member> {
  const { data, error } = await supabase.rpc("update_member", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_display_name: payload.display_name,
    p_role: payload.role,
    p_notes: payload.notes,
  })

  if (error) throw new Error(error.message)
  return data as Member
}

export async function updateMemberCouple(payload: UpdateMemberCouplePayload): Promise<Member> {
  const { data, error } = await supabase.rpc("update_member_couple", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_couple: payload.couple,
  })

  if (error) throw new Error(error.message)
  return data as Member
}

export async function updateMemberAccessGroup(payload: UpdateMemberAccessGroupPayload): Promise<Member> {
  const { data, error } = await supabase.rpc("update_member_access_group", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_access_group_id: payload.access_group_id,
  })

  if (error) throw new Error(error.message)
  return data as Member
}

export async function freezeMember(payload: FreezeMemberPayload): Promise<Member> {
  const { data, error } = await supabase.rpc("freeze_member", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_freeze: payload.freeze,
  })

  if (error) throw new Error(error.message)
  return data as Member
}

export async function deleteMember(payload: DeleteMemberPayload): Promise<void> {
  const { error } = await supabase.rpc("delete_member", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  })
  if (error) throw new Error(error.message)
}

/**
 * Realtime on event_members. RLS scopes reads to the caller's own row, so this
 * only ever delivers changes to YOUR row (incl. your own freeze/removal). The
 * roster list itself is read via the gated get_members RPC.
 */
export function subscribeToMembers(
  eventId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
): () => void {
  const channel = supabase
    .channel(`admin-members-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "event_members",
        filter: `event_id=eq.${eventId}`,
      },
      onChange,
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}

