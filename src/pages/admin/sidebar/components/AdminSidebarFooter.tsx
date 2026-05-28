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
  const { memberDisplayName, memberRoleName, memberRoleShortName } =
    useAdminStore();
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
                    "flex shrink-0 aspect-square items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground capitalize truncate",
                    state === "expanded" || isMobile ? "size-9" : "size-8",
                  )}
                >
                  {memberRoleShortName}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {memberDisplayName}
                  </span>
                  <span className="truncate text-xs">{memberRoleName}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-full">
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
