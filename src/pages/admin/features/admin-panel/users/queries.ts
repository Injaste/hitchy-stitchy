import { useQuery } from "@/lib/query/useQuery";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { getUsers, updateAdminStatus, toggleActiveStatus } from "./api";

export function useUsers() {
  return useQuery(getUsers, { key: "users" });
}

export function useUserMutations() {
  const { teamRoles, setTeamRoles } = useAdminStore();

  const toggleAdmin = useMutation(
    (args: { role: string; isAdmin: boolean }) => updateAdminStatus(args),
    {
      successMessage: "Admin status updated",
      errorMessage: "Failed to update admin status",
      onSuccess: ({ role, isAdmin }) => {
        setTeamRoles(teamRoles.map((r) => (r.role === role ? { ...r, isAdmin } : r)));
      },
    }
  );

  const toggleActive = useMutation(
    (args: { role: string; isActive: boolean }) => toggleActiveStatus(args),
    {
      successMessage: "Access updated",
      errorMessage: "Failed to update access",
      onSuccess: ({ role, isActive }) => {
        setTeamRoles(teamRoles.map((r) => (r.role === role ? { ...r, isActive } : r)));
      },
    }
  );

  return { toggleAdmin, toggleActive };
}
