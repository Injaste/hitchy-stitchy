import { z } from "zod";
import type { Role } from "../roles/types";

export type MemberStatusLabel = "active" | "pending" | "frozen" | "rejected";

export interface Member {
  id: string;
  event_id: string;
  user_id: string | null;
  role_id: string;
  email: string;
  display_name: string;
  /** Bypasses all permission checks — set directly on event_members, not derived from role */
  is_root: boolean;
  /** Free-text personal title, e.g. "Maid of Honor" */
  label: string | null;
  /** Couple identity flags — at most one bride and one groom per event */
  is_bride: boolean;
  is_groom: boolean;
  /** Personal notes — what this specific person handles */
  notes: string | null;
  invited_by: string | null;
  frozen_at: string | null;
  invited_at: string;
  joined_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  preferences: Record<string, unknown>;
  role: Role | null;
}

export const inviteMemberSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  email: z.email("Enter a valid email"),
  role_id: z.string().min(1, "Select a role"),
  label: z
    .string()
    .max(80, "Label is too long")
    .transform((v) => v.trim() || null),
  notes: z
    .string()
    .max(500, "Notes is too long")
    .transform((v) => v.trim() || null),
});

export const editMemberSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  role_id: z.string().min(1, "Select a role"),
  label: z
    .string()
    .max(80, "Label is too long")
    .transform((v) => v.trim() || null),
  notes: z
    .string()
    .max(500, "Notes is too long")
    .transform((v) => v.trim() || null),
  couple_role: z.enum(["bride", "groom"]).nullable(),
});

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
export type EditMemberValues = z.infer<typeof editMemberSchema>;

export interface InviteMemberPayload {
  event_id: string;
  display_name: string;
  email: string;
  role_id: string;
  label: string | null;
  notes: string | null;
}

/** Payload for update_member RPC (display_name / label / notes only). */
export interface UpdateMemberPayload {
  event_id: string;
  id: string;
  display_name: string;
  label: string | null;
  notes: string | null;
}

/** Payload for update_member_couple RPC. */
export interface UpdateMemberCouplePayload {
  event_id: string;
  id: string;
  is_bride: boolean;
  is_groom: boolean;
}

/** Payload for update_member_role RPC. */
export interface UpdateMemberRolePayload {
  event_id: string;
  id: string;
  role_id: string;
}

export interface FreezeMemberPayload {
  event_id: string;
  id: string;
  freeze: boolean;
}

export interface DeleteMemberPayload {
  event_id: string;
  id: string;
  display_name: string;
}
