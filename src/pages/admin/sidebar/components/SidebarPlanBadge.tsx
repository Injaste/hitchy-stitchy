import { Link } from "react-router-dom";
import { Crown, Sparkles } from "lucide-react";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAdminStore } from "../../store/useAdminStore";
import { useAccess } from "../../hooks/useAccess";
import { usePlan } from "../../hooks/usePlan";
import { useUpgradeModalStore } from "../../plan/hooks/useUpgradeModalStore";

/** Super-admin-only plan indicator in the sidebar footer. Free/pending shows an
 *  upgrade entry that opens the shared UpgradeModal; Pro is a quiet status that
 *  links to Settings → Billing. Collapses to its icon (with tooltip) in icon mode.
 *  Only super admins can act on the plan, so members never see it. */
const SidebarPlanBadge = () => {
  const { isSuperAdmin } = useAccess();
  const { slug } = useAdminStore();
  const { isPro, isPending } = usePlan();
  const openUpgrade = useUpgradeModalStore((s) => s.open);

  if (!isSuperAdmin) return null;

  // Anything not on active Pro is an upsell entry; Pro is a manage link.
  const upsell = !isPro || isPending;
  const label = isPending
    ? "Complete payment"
    : upsell
      ? "Upgrade to Pro"
      : "Pro plan";

  return (
    <SidebarMenuItem>
      {upsell ? (
        <SidebarMenuButton
          onClick={openUpgrade}
          tooltip={label}
          className="cursor-pointer text-primary hover:text-primary"
        >
          <Sparkles className="size-4" />
          <span className="font-medium">{label}</span>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton asChild tooltip="Manage plan">
          <Link to={`/${slug}/admin/settings`}>
            <Crown className="size-4 text-primary" />
            <span>{label}</span>
          </Link>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
};

export default SidebarPlanBadge;
