import { z } from "zod";
import type { AccessGroup } from "../access/types";

export type MemberStatusLabel = "active" | "pending" | "expired" | "frozen";

export interface Member {
  id: string;
  event_id: string;
  access_group_id: string;
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
  /** null for non-managers (audit field, gated by get_members) */
  invited_at: string | null;
  joined_at: string | null;
  /** Pending share-link token — managers only, and only while the member hasn't joined. */
  invite_token: string | null;
  /** Invite-link deadline (ISO) — managers only, pending members only. */
  invite_expires_at: string | null;
  created_at: string;
  updated_at: string;
  preferences: Record<string, unknown>;
  accessGroup: AccessGroup | null;
}

/** Create and edit share one shape — couple_role is set via the switches in
 *  both flows. The reserved-role guard is layered on by makeMemberSchema. */
export const memberSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  access_group_id: z.string().min(1, "Select an access group"),
  role: z
    .string()
    .trim()
    .min(1, "Role is required")
    .max(80, "Role is too long"),
  notes: z
    .string()
    .max(500, "Notes is too long")
    .transform((v) => v.trim() || null),
  couple_role: z.enum(["bride", "groom"]).nullable(),
});

export type MemberValues = z.infer<typeof memberSchema>;

/** Bride/Groom are always reserved; `reserved` adds the couple members' actual
 *  roles. Compared trimmed + lower-cased, empties dropped. */
const reservedRoleSet = (reserved: string[]) =>
  new Set(
    ["bride", "groom", ...reserved]
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean),
  );

const RESERVED_ROLE_MESSAGE = "Reserved for the couple";

/** Couple members (couple_role set) keep their reserved role; everyone else is blocked. */
export const makeMemberSchema = (reservedRoles: string[]) => {
  const reserved = reservedRoleSet(reservedRoles);
  return memberSchema.refine(
    (d) => d.couple_role != null || !reserved.has(d.role.trim().toLowerCase()),
    { path: ["role"], message: RESERVED_ROLE_MESSAGE },
  );
};

export interface CreateMemberPayload {
  event_id: string;
  display_name: string;
  access_group_id: string;
  role: string | null;
  notes: string | null;
  /** Optional couple assignment at creation — delegated to update_member_couple. */
  couple: "bride" | "groom" | null;
}

/** Payload for regenerate_member_invite RPC (fresh token + reset 7-day clock). */
export interface RegenerateMemberInvitePayload {
  event_id: string;
  id: string;
  /** Current link expiry — lets the UI enforce the regenerate cooldown locally. */
  invite_expires_at: string | null;
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
  couple: "bride" | "groom" | null;
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
