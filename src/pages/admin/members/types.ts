import { z } from "zod"
import type { Role } from "../roles/types"

export interface Member {
  id: string
  event_id: string
  user_id: string | null
  role_id: string | null
  email: string
  display_name: string
  is_frozen: boolean
  invited_at: string | null
  joined_at: string | null
  arrived_at?: string | null
  created_at: string
  updated_at: string
  role?: Role | null
}

export const inviteMemberSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  email: z.string().email("Enter a valid email"),
  role_id: z.string().min(1, "Select a role"),
})

export const editMemberSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  email: z.string().email("Enter a valid email"),
  role_id: z.string().min(1, "Select a role"),
})

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>
export type EditMemberValues = z.infer<typeof editMemberSchema>

export interface InviteMemberPayload {
  event_id: string
  display_name: string
  email: string
  role_id: string
}

export interface UpdateMemberPayload {
  id: string
  display_name?: string
  email?: string
  role_id?: string | null
}

export interface SetMemberFrozenPayload {
  id: string
  is_frozen: boolean
}

export interface DeleteMemberPayload {
  id: string
}
