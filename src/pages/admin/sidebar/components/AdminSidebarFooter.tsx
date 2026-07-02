import { ChevronsUpDown, LayoutDashboard, Settings } from "lucide-react";
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
import { useAccountSettingsStore } from "@/pages/account/useAccountSettingsStore";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import MemberCrown from "../../components/MemberCrown";
import AdminLogout from "../AdminLogout";
import SidebarPlanBadge from "./SidebarPlanBadge";

const AdminSidebarFooter = () => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const { memberDisplayName, memberRole, isBride, isGroom } = useAdminStore();
  const openAccountSettings = useAccountSettingsStore((s) => s.open);
  const displayLabel =
    memberRole ?? (isBride ? "Bride" : isGroom ? "Groom" : null);

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
                      "flex aspect-square items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground capitalize truncate transition-colors group-hover/menu-button:bg-primary group-hover/menu-button:text-primary-foreground group-data-[state=open]/menu-button:bg-primary group-data-[state=open]/menu-button:text-primary-foreground",
                      state === "expanded" || isMobile ? "size-9" : "size-8",
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
                  <MemberCrown
                    isBride={isBride}
                    isGroom={isGroom}
                    className="-top-2 -left-1.5 size-4 group-data-[collapsible=icon]:size-3.5 group-data-[collapsible=icon]:-rotate-40 group-data-[collapsible=icon]:-top-1.5 group-data-[collapsible=icon]:-left-1"
                  />
                </div>
                <div
                  className={cn(
                    "grid flex-1 text-left text-sm leading-tight",
                    !displayLabel && "content-center",
                  )}
                >
                  <span className="truncate text-xs font-semibold">
                    {memberDisplayName}
                  </span>
                  {displayLabel && (
                    <span className="truncate text-xs">{displayLabel}</span>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="min-w-40">
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
