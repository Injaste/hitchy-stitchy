export type MemberStatusLabel = "active" | "pending" | "expired" | "frozen";

export interface AccessGroup {
  id: string;
  event_id: string;
  name: string;
  permissions: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  event_id: string;
  access_group_id: string;
  display_name: string;
  is_root: boolean;
  role: string | null;
  is_bride: boolean;
  is_groom: boolean;
  notes: string | null;
  invited_by: string | null;
  frozen_at: string | null;
  invited_at: string | null;
  joined_at: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
  created_at: string;
  updated_at: string;
  preferences: Record<string, unknown>;
  accessGroup: AccessGroup | null;
}
