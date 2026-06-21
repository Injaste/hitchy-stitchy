import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import { fetchPublicPlan } from "./api";

/** A current-version plan from the public catalog by tier — feeds the upgrade +
 *  activation surfaces (pitch, price). The catalog is global and near-static, so
 *  cache it generously and only fetch when a modal actually needs it. */
export function usePublicPlanQuery(tier: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.planPublic(tier),
    queryFn: () => fetchPublicPlan(tier),
    enabled: enabled && !!tier,
    staleTime: 1000 * 60 * 60, // 1h — pricing rarely changes
  });
}

/** Convenience for the Pro tier (the upgrade modal's target). */
export function useProPlanQuery(enabled = true) {
  return usePublicPlanQuery("pro", enabled);
}
