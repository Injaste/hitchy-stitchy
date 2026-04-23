import { supabase } from "@/lib/supabase"
import type {
  Member,
  InviteMemberPayload,
  UpdateMemberPayload,
  SetMemberFrozenPayload,
  DeleteMemberPayload,
} from "./types"

const MEMBER_FIELDS = `
  id, event_id, user_id, role_id, email, display_name,
  is_frozen, invited_at, joined_at, created_at, updated_at,
  role:event_roles ( id, event_id, name, short_name, category, description, created_at, updated_at )
`

export async function fetchMembers(eventId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("event_members")
    .select(MEMBER_FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Member[]
}

export async function inviteMember(
  payload: InviteMemberPayload,
): Promise<Member> {
  const { data, error } = await supabase
    .from("event_members")
    .insert({
      event_id: payload.event_id,
      display_name: payload.display_name,
      email: payload.email,
      role_id: payload.role_id,
    })
    .select(MEMBER_FIELDS)
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Member
}

export async function updateMember(payload: UpdateMemberPayload): Promise<void> {
  const { id, ...fields } = payload
  const { error } = await supabase
    .from("event_members")
    .update(fields)
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function deleteMember(payload: DeleteMemberPayload): Promise<void> {
  const { id } = payload
  const { error } = await supabase
    .from("event_members")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function setMemberFrozen(
  payload: SetMemberFrozenPayload,
): Promise<void> {
  const { error } = await supabase
    .from("event_members")
    .update({ is_frozen: payload.is_frozen })
    .eq("id", payload.id)

  if (error) throw new Error(error.message)
}
