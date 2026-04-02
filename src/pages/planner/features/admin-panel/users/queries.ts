import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { getUsers, updateAdminStatus } from "./api";

export const usersQueryKey = ["users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: getUsers,
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const toggleAdmin = useMutation(
    (args: { role: string; isAdmin: boolean }) => updateAdminStatus(args),
    {
      successMessage: "Admin status updated",
      errorMessage: "Failed to update admin status",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: usersQueryKey });
        queryClient.invalidateQueries({ queryKey: ["teamRolesQueryKey"] });
      },
    }
  );

  return { toggleAdmin };
}