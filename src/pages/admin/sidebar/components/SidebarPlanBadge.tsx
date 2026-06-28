import { Sparkles } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAccess } from "../../hooks/useAccess";
import { usePlan } from "../../hooks/usePlan";
import { useUpgradeModalStore } from "../../plan/hooks/useUpgradeModalStore";

/** Super-admin-only upgrade entry in the sidebar footer. Only renders when
 *  there's something to act on (a higher tier to buy, or a pending event) — the
 *  top tier with nothing pending is shown instead as the crown on the member
 *  avatar (see AdminSidebarFooter). Opens the shared UpgradeModal. */
const SidebarPlanBadge = () => {
  const { isSuperAdmin } = useAccess();
  const { isPending, canUpgrade, nextTier } = usePlan();
  const openUpgrade = useUpgradeModalStore((s) => s.open);

  // Parked for now — reworking this surface later. Flip to false to restore.
  const parked: boolean = true;

  // Top tier with nothing pending has nothing to act on — the crown carries status.
  if (parked || !isSuperAdmin || (!isPending && !canUpgrade)) return null;

  const label = isPending
    ? "Complete payment"
    : nextTier
      ? `Upgrade to ${nextTier.name}`
      : "Upgrade";

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
