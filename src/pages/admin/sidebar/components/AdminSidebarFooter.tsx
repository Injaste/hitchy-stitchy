import { ChevronsUpDown, Crown, LayoutDashboard, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminStore } from "../../store/useAdminStore";
import { usePlan } from "../../hooks/usePlan";
import { useAccess } from "../../hooks/useAccess";
import { useAccountSettingsStore } from "@/pages/account/useAccountSettingsStore";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import AdminLogout from "../AdminLogout";
import SidebarPlanBadge from "./SidebarPlanBadge";

const AdminSidebarFooter = () => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const { memberDisplayName, memberRole, isBride, isGroom } = useAdminStore();
  const { isPro } = usePlan();
  const { isSuperAdmin } = useAccess();
  const openAccountSettings = useAccountSettingsStore((s) => s.open);
  const displayLabel = memberRole ?? (isBride ? "Bride" : isGroom ? "Groom" : null);
  // Active Pro reads as a crown on the avatar; only the owner (super admin) sees it.
  const showCrown = isPro && isSuperAdmin;

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarPlanBadge />
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "h-auto cursor-pointer overflow-visible py-3",
                  state === "expanded" ? "rounded-lg" : "rounded-full",
                )}
              >
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      "flex aspect-square items-center justify-center bg-muted text-xs font-medium text-muted-foreground capitalize truncate transition-colors group-hover/menu-button:bg-primary group-hover/menu-button:text-primary-foreground group-data-[state=open]/menu-button:bg-primary group-data-[state=open]/menu-button:text-primary-foreground",
                      state === "expanded" || isMobile ? "size-9 rounded-md" : "size-8 rounded-full",
                    )}
                  >
                    {memberDisplayName
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase() || "?"}
                  </div>
                  {showCrown && (
                    <Crown
                      aria-hidden
                      className="pointer-events-none absolute -top-2.5 -left-1.5 size-4 -rotate-[28deg] fill-amber-400 text-amber-500 drop-shadow-sm group-data-[collapsible=icon]:hidden"
                    />
                  )}
                </div>
                <div className={cn("grid flex-1 text-left text-sm leading-tight", !displayLabel && "content-center")}>
                  <span className="truncate font-medium">
                    {memberDisplayName}
                  </span>
                  {displayLabel && (
                    <span className="truncate text-xs">{displayLabel}</span>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" style={{ width: "var(--radix-popper-anchor-width)" }}>
              <DropdownMenuItem onSelect={() => openAccountSettings()}>
                <Settings className="w-4 h-4" />
                Account settings
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <AdminLogout />
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default AdminSidebarFooter;
