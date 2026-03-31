import { useQuery } from "@/lib/query/useQuery";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";
import { getUsers, updateAdminStatus } from "./api";

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

  return { toggleAdmin };
}
