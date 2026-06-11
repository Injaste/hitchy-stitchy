import { isSuperAdminMember } from "@/pages/admin/utils/memberUtils";
import type { Member } from "@/pages/admin/members/types";

export interface CallerPolicy {
  isSuperAdmin: boolean;
  memberId: string;
  /** Caller's group grants members:full (can manage the team). */
  canManageTeam: boolean;
}

// -----------------------------------------------------------------------------
// Member-management guards (mirror the server RPCs). Managing a member —
// change-group / delete / freeze — is gated by a CAPABILITY rank:
//   0 = superadmin (couple/owner), 1 = members:full, 2 = everyone else.
// You may act on a member only if you outrank them (lower number). Couple/owner
// (rank 0) are unreachable; you can never act on yourself. Editing a member's
// profile (name/role/notes) is NOT peer-gated — only access/delete/freeze are.
// -----------------------------------------------------------------------------

type RankTarget = Pick<Member, "is_root" | "is_bride" | "is_groom" | "accessGroup">;

function targetRank(target: RankTarget): number {
  if (isSuperAdminMember(target)) return 0;
  return target.accessGroup?.permissions?.members === "full" ? 1 : 2;
}

function callerRank(caller: CallerPolicy): number {
  return caller.isSuperAdmin ? 0 : caller.canManageTeam ? 1 : 2;
}

/** Whether the caller outranks the target enough to manage them. */
function canManage(caller: CallerPolicy, target: Pick<Member, "id"> & RankTarget): boolean {
  if (caller.memberId === target.id) return false; // never yourself
  if (isSuperAdminMember(target)) return false; // couple/owner protected
  return callerRank(caller) < targetRank(target);
}

/** Guard: caller may edit this member's name/role/notes. Self always allowed;
 * otherwise needs manage-team. Not peer-gated. */
export function guardEditMember(
  caller: CallerPolicy,
  target: Pick<Member, "id" | "frozen_at">,
): boolean {
  if (target.frozen_at) return false;
  if (caller.memberId === target.id) return true;
  return caller.isSuperAdmin || caller.canManageTeam;
}

/** Guard: caller may delete this member. */
export function guardDeleteMember(
  caller: CallerPolicy,
  target: Pick<Member, "id" | "is_root" | "is_bride" | "is_groom" | "accessGroup">,
): boolean {
  return canManage(caller, target);
}

/** Guard: caller may freeze/unfreeze this member. */
export function guardFreezeMember(
  caller: CallerPolicy,
  target: Pick<
    Member,
    "id" | "is_root" | "is_bride" | "is_groom" | "accessGroup"
  >,
): boolean {
  return canManage(caller, target);
}

/** Guard: caller may change this member's access group. */
export function guardChangeAccessGroup(
  caller: CallerPolicy,
  target: Pick<Member, "id" | "is_root" | "is_bride" | "is_groom" | "accessGroup">,
): boolean {
  return canManage(caller, target);
}
