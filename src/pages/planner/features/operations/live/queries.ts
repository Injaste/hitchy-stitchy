import { useQuery } from "@/lib/query/useQuery";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";
import { getLogs, markArrived } from "./api";

export function useLogs() {
  return useQuery(getLogs, { key: "logs" });
}

export function useArrivalMutations() {
  const { arrivals, setArrivals, addLog, currentRole } = useAdminStore();

  const arrive = useMutation(
    (role: string) => markArrived(role),
    {
      successMessage: "Arrival marked",
      errorMessage: "Failed to mark arrival",
      onSuccess: (role) => {
        setArrivals({ ...arrivals, [role]: true });
        addLog(currentRole, `${role} has arrived.`);
      },
    }
  );

  return { arrive };
}
