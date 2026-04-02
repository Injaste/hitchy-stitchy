import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { useModalStore } from "@/pages/planner/store/useModalStore";
import { getTeamRoles, createRole, updateRole, deleteRole } from "./api";
import type { TeamMember } from "./types";

export const teamRolesQueryKey = ["teamRoles"] as const;

export function useTeamRoles() {
  return useQuery({
    queryKey: teamRolesQueryKey,
    queryFn: getTeamRoles,
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();
  const { closeRoleModal } = useModalStore();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: teamRolesQueryKey });

  const create = useMutation(
    (role: TeamMember) => createRole(role),
    {
      successMessage: "Role created",
      errorMessage: "Failed to create role",
      onSuccess: () => {
        invalidate();
        closeRoleModal();
      },
    }
  );

  const update = useMutation(
    (role: TeamMember) => updateRole(role),
    {
      successMessage: "Role updated",
      errorMessage: "Failed to update role",
      onSuccess: () => {
        invalidate();
        closeRoleModal();
      },
    }
  );

  const remove = useMutation(
    (roleName: string) => deleteRole(roleName),
    {
      successMessage: "Role deleted",
      errorMessage: "Failed to delete role",
      onSuccess: () => {
        invalidate();
        closeRoleModal();
      },
    }
  );

  return { create, update, remove };
}