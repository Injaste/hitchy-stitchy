import { Sparkles } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAccess } from "../../hooks/useAccess";
import { usePlan } from "../../hooks/usePlan";
import { useUpgradeModalStore } from "../../plan/hooks/useUpgradeModalStore";

/** Super-admin-only upgrade entry in the sidebar footer. Only renders when
 *  there's something to pay for (Free, or a pending event) — an active Pro plan
 *  is shown instead as the crown on the member avatar (see AdminSidebarFooter).
 *  Opens the shared UpgradeModal. */
const SidebarPlanBadge = () => {
  const { isSuperAdmin } = useAccess();
  const { isPro, isPending } = usePlan();
  const openUpgrade = useUpgradeModalStore((s) => s.open);

  // Active Pro has nothing to act on here — the crown carries the status.
  if (!isSuperAdmin || (isPro && !isPending)) return null;

  const label = isPending ? "Complete payment" : "Upgrade to Pro";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={openUpgrade}
        tooltip={label}
        className="cursor-pointer text-primary hover:text-primary"
      >
        <Sparkles className="size-4" />
        <span className="font-medium">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default SidebarPlanBadge;
