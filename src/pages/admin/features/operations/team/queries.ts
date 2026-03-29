import { useQuery } from "@/lib/query/useQuery";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useTeamModalStore } from "@/pages/admin/store/useTeamModalStore";
import { getTeamRoles, createRole, updateRole, deleteRole } from "./api";
import type { TeamMember } from "./types";

export function useTeamRoles() {
  return useQuery(getTeamRoles, { key: "teamRoles" });
}

export function useRoleMutations() {
  const { teamRoles, setTeamRoles } = useAdminStore();
  const { closeRoleModal } = useTeamModalStore();

  const create = useMutation(
    (role: TeamMember) => createRole(role),
    {
      successMessage: "Role created",
      errorMessage: "Failed to create role",
      onSuccess: (newRole) => {
        setTeamRoles([...teamRoles, newRole]);
        closeRoleModal();
      },
    }
  );

  const update = useMutation(
    (role: TeamMember) => updateRole(role),
    {
      successMessage: "Role updated",
      errorMessage: "Failed to update role",
      onSuccess: (updated) => {
        setTeamRoles(teamRoles.map((r) => (r.role === updated.role ? updated : r)));
        closeRoleModal();
      },
    }
  );

  const remove = useMutation(
    (roleName: string) => deleteRole(roleName),
    {
      successMessage: "Role deleted",
      errorMessage: "Failed to delete role",
      onSuccess: (roleName) => {
        setTeamRoles(teamRoles.filter((r) => r.role !== roleName));
        closeRoleModal();
      },
    }
  );

  return { create, update, remove };
}
