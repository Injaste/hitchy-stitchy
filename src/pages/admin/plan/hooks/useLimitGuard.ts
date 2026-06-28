import { usePlan } from "../../hooks/usePlan";
import { useUpgradeModalStore } from "./useUpgradeModalStore";
import type { PlanResource } from "../plan-config";

/** Intercept an "add" action when the resource is already at its cap: open the
 *  upgrade modal instead of letting the click reach an RPC that would just error.
 *  Returns true when it intercepted — the caller should bail. UX only; the server
 *  (assert_plan) is still the real boundary, so a stale count just falls through
 *  to the RPC's generic limit error. */
export function useLimitGuard() {
  const { meter } = usePlan();
  const openUpgrade = useUpgradeModalStore((s) => s.open);

  return (resource: PlanResource): boolean => {
    if (!meter(resource).atLimit) return false;
    openUpgrade({ kind: "limit", resource });
    return true;
  };
}
