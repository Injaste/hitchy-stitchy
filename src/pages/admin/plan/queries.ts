import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import { fetchPublicPlan } from "./api";

/** The current Pro plan from the public catalog — feeds the upgrade modal's
 *  pitch + price. The catalog is global and near-static, so cache it generously
 *  and only fetch when the modal actually needs it. */
export function useProPlanQuery(enabled = true) {
  return useQuery({
    queryKey: adminKeys.planPublic("pro"),
    queryFn: () => fetchPublicPlan("pro"),
    enabled,
    staleTime: 1000 * 60 * 60, // 1h — pricing rarely changes
  });
}
