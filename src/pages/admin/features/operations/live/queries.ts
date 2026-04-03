import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { getLogs, markArrived } from "./api";

export const logsQueryKey = ["logs"] as const;

export function useLogs() {
  return useQuery({
    queryKey: logsQueryKey,
    queryFn: getLogs,
  });
}

export function useArrivalMutations() {
  const queryClient = useQueryClient();
  const { addLog, currentRole } = useAdminStore();

  const arrive = useMutation(
    (role: string) => markArrived(role),
    {
      successMessage: "Arrival marked",
      errorMessage: "Failed to mark arrival",
      onSuccess: (_, role) => {
        queryClient.invalidateQueries({ queryKey: logsQueryKey });
        addLog(currentRole, `${role} has arrived.`);
      },
    }
  );

  return { arrive };
}