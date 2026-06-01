import { ChevronsUpDown, LayoutDashboard, ClockAlert } from "lucide-react";
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
import { useCueStore } from "../../store/useCueStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import AdminLogout from "../AdminLogout";

const AdminSidebarFooter = () => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const { memberDisplayName, memberLabel, isBride, isGroom } = useAdminStore();
  const displayLabel = memberLabel ?? (isBride ? "Bride" : isGroom ? "Groom" : null);
  const hasCue = useCueStore((s) => s.hasCue);
  const setActiveCue = useCueStore((s) => s.setActiveCue);

  return (
    <SidebarFooter>
      <SidebarMenu>
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
              <DropdownMenuItem
                onClick={() => {
                  if (hasCue) return setActiveCue(null);
                  setActiveCue({
                    id: "1",
                    dayId: "1",
                    timeStart: "11 pm",
                    title: "Test Cue",
                  });
                }}
              >
                <ClockAlert className="w-4 h-4" />
                Test Start Cue
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
