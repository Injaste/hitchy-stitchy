import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import {
  guardEditMember,
  guardDeleteMember,
  guardFreezeMember,
  guardChangeAccessGroup,
  type CallerPolicy,
} from "@/lib/access/policy";
import { getLevel, type Resource } from "../access/types";

export function useAccess() {
  // All values reactive — no getState() snapshot.
  const isSuperAdmin = useAdminStore((s) => s.isSuperAdmin);
  const memberId = useAdminStore((s) => s.memberId);
  const permissions = useAdminStore((s) => s.permissions);

  // Two verbs underpin everything: can you see it, can you edit it.
  const canView = (...resources: Resource[]) =>
    isSuperAdmin ||
    resources.every((r) => getLevel(permissions, r) !== "none");
  const canEdit = (...resources: Resource[]) =>
    isSuperAdmin || resources.every((r) => getLevel(permissions, r) === "full");

  // Back-compat verb names consumed across timeline/tasks/guests/etc. Reads map
  // to canView; every write action maps to the single edit level.
  const canRead = canView;
  const canCreate = canEdit;
  const canUpdate = canEdit;
  const canDelete = canEdit;

  // Intent-named capabilities.
  const canManageMembers = canEdit("members"); // invite/edit/delete/freeze the team
  const canManageCouple = isSuperAdmin;

  const caller: CallerPolicy = {
    isSuperAdmin,
    memberId,
    canManageTeam: canManageMembers,
  };

  return {
    isSuperAdmin,
    canView,
    canEdit,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    // Identity-named capabilities
    canManageMembers,
    canManageCouple,
    // Guards — target-specific shields (from lib/access/policy.ts)
    guardEditMember: (target: Parameters<typeof guardEditMember>[1]) =>
      guardEditMember(caller, target),
    guardDeleteMember: (target: Parameters<typeof guardDeleteMember>[1]) =>
      guardDeleteMember(caller, target),
    guardFreezeMember: (target: Parameters<typeof guardFreezeMember>[1]) =>
      guardFreezeMember(caller, target),
    guardChangeAccessGroup: (target: Parameters<typeof guardChangeAccessGroup>[1]) =>
      guardChangeAccessGroup(caller, target),
  };
}
