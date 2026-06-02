import { z } from "zod";
import type { AccessGroup } from "../access/types";

export type MemberStatusLabel = "active" | "pending" | "frozen" | "rejected";

export interface Member {
  id: string;
  event_id: string;
  user_id: string | null;
  access_group_id: string;
  email: string;
  display_name: string;
  /** Bypasses all permission checks — set directly on event_members, not derived from access group */
  is_root: boolean;
  /** Free-text personal role/title, e.g. "Maid of Honor" */
  role: string | null;
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
  accessGroup: AccessGroup | null;
}

export const inviteMemberSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  email: z.email("Enter a valid email"),
  access_group_id: z.string().min(1, "Select an access group"),
  role: z
    .string()
    .max(80, "Role is too long")
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
  access_group_id: z.string().min(1, "Select an access group"),
  role: z
    .string()
    .max(80, "Role is too long")
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
  access_group_id: string;
  role: string | null;
  notes: string | null;
}

/** Payload for update_member RPC (display_name / role / notes only). */
export interface UpdateMemberPayload {
  event_id: string;
  id: string;
  display_name: string;
  role: string | null;
  notes: string | null;
}

/** Payload for update_member_couple RPC. */
export interface UpdateMemberCouplePayload {
  event_id: string;
  id: string;
  is_bride: boolean;
  is_groom: boolean;
}

/** Payload for update_member_access_group RPC. */
export interface UpdateMemberAccessGroupPayload {
  event_id: string;
  id: string;
  access_group_id: string;
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
