import { ChevronsUpDown, LayoutDashboard } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import AdminLogout from "../AdminLogout";
import SidebarPlanBadge from "./SidebarPlanBadge";

const AdminSidebarFooter = () => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const { memberDisplayName, memberRole, isBride, isGroom } = useAdminStore();
  const displayLabel = memberRole ?? (isBride ? "Bride" : isGroom ? "Groom" : null);

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
                  "cursor-pointer",
                  state === "expanded" ? "rounded-lg" : "rounded-full",
                )}
              >
                <div
                  className={cn(
                    "flex shrink-0 aspect-square items-center justify-center bg-muted text-xs font-medium text-muted-foreground capitalize truncate transition-colors group-hover/menu-button:bg-primary group-hover/menu-button:text-primary-foreground group-data-[state=open]/menu-button:bg-primary group-data-[state=open]/menu-button:text-primary-foreground",
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
