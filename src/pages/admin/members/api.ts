import { supabase } from "@/lib/supabase"
import type {
  Member,
  InviteMemberPayload,
  UpdateMemberPayload,
  UpdateMyDisplayNamePayload,
  FreezeMemberPayload,
  DeleteMemberPayload,
} from "./types"

const MEMBER_FIELDS = `
  id, event_id, user_id, role_id, email, display_name,
  is_frozen, invited_at, joined_at, rejected_at, created_at, updated_at, preferences,
  role:event_roles ( id, event_id, name, short_name, category, description, created_at, updated_at )
`

export async function fetchMembers(eventId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("event_members")
    .select(MEMBER_FIELDS)
    .eq("event_id", eventId)
    .order("rejected_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Member[]
}

export async function inviteMember(payload: InviteMemberPayload): Promise<Member> {
  const { data, error } = await supabase.rpc("invite_member", {
    p_event_id: payload.event_id,
    p_email: payload.email,
    p_display_name: payload.display_name,
    p_role_id: payload.role_id,
  })

  if (error) throw new Error(error.message)
  return data as Member
}

export async function updateMember(payload: UpdateMemberPayload): Promise<void> {
  const { error } = await supabase.rpc("update_member", {
    p_id: payload.id,
    p_display_name: payload.display_name,
    p_role_id: payload.role_id,
  })

  if (error) throw new Error(error.message)
}

export async function updateMyDisplayName(
  payload: UpdateMyDisplayNamePayload
): Promise<void> {
  const { error } = await supabase.rpc("update_my_display_name", {
    p_event_id: payload.event_id,
    p_display_name: payload.display_name,
  })

  if (error) throw new Error(error.message)
}

export async function freezeMember(payload: FreezeMemberPayload): Promise<void> {
  const { error } = await supabase.rpc("freeze_member", {
    p_id: payload.id,
    p_is_frozen: payload.is_frozen,
  })

  if (error) throw new Error(error.message)
}

export async function deleteMember(payload: DeleteMemberPayload): Promise<void> {
  const { error } = await supabase.rpc("delete_member", { p_id: payload.id })
  if (error) throw new Error(error.message)
}