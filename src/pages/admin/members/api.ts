import { supabase } from "@/lib/supabase"
import type {
  Member,
  InviteMemberPayload,
  UpdateMemberPayload,
  UpdateMemberAccessGroupPayload,
  UpdateMemberCouplePayload,
  FreezeMemberPayload,
  DeleteMemberPayload,
} from "./types"

const MEMBER_FIELDS = `
  id, event_id, user_id, access_group_id, email, display_name,
  is_root, role, is_bride, is_groom, notes,
  invited_by, frozen_at, invited_at, joined_at, rejected_at,
  created_at, updated_at, preferences,
  accessGroup:event_access_groups ( id, event_id, name, permissions, created_at, updated_at )
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
    p_access_group_id: payload.access_group_id,
    p_role: payload.role,
    p_notes: payload.notes,
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
    p_is_bride: payload.is_bride,
    p_is_groom: payload.is_groom,
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
