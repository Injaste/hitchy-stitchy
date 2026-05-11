import {
  CalendarHeart,
  Clock,
  CheckSquare,
  Users,
  Shield,
  KeyRound,
  ChevronsUpDown,
  Mail,
  ClipboardList,
  LayoutDashboard,
  ClockAlert,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAdminStore } from "../../store/useAdminStore";
import useActivePage from "../../hooks/useActivePage";

import NavItem from "./NavItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminLogout from "./AdminLogout";
import { Link } from "react-router-dom";
import PortalToApp from "@/components/custom/portal-to-app";
import { useCueStore } from "../../store/useCueStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const isMobile = useIsMobile();
  const { state } = useSidebar();

  const {
    eventName,
    slug,
    memberDisplayName,
    memberRoleName,
    memberRoleShortName,
    isAdmin,
  } = useAdminStore();
  const activePage = useActivePage();
  const hasCue = useCueStore((s) => s.hasCue);
  const setActiveCue = useCueStore((s) => s.setActiveCue);

  const base = `/${slug}/admin`;

  return (
    <PortalToApp>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="pointer-events-none">
                <div
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary-foreground",
                    state === "expanded" || isMobile ? "size-9" : "size-8",
                  )}
                >
                  <CalendarHeart className="size-4 text-sidebar-primary" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-bold truncate">{eventName}</span>
                  <span className="truncate text-xs">{slug}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent activeId={activePage}>
          <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem
                  icon={Clock}
                  label="Timeline"
                  to={`${base}/timeline`}
                  isActive={activePage === "timeline"}
                />
                <NavItem
                  icon={CheckSquare}
                  label="Tasks"
                  to={`${base}/tasks`}
                  isActive={activePage === "tasks"}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="mx-4" />

          <SidebarGroup>
            <SidebarGroupLabel>Teams</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem
                  icon={Users}
                  label="Members"
                  to={`${base}/members`}
                  isActive={activePage === "members"}
                />
                <NavItem
                  icon={Shield}
                  label="Roles"
                  to={`${base}/roles`}
                  isActive={activePage === "roles"}
                />
                <NavItem
                  icon={KeyRound}
                  label="Permissions"
                  to={`${base}/permissions`}
                  isActive={activePage === "permissions"}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="mx-4" />

          {isAdmin && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>RSVP</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <NavItem
                      icon={Mail}
                      label="Invitation"
                      to={`${base}/invitation`}
                      isActive={activePage === "invitation"}
                    />
                    <NavItem
                      icon={ClipboardList}
                      label="Guests"
                      to={`${base}/guests`}
                      isActive={activePage === "guests"}
                    />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <div
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-xl bg-muted text-xs font-medium text-muted-foreground capitalize",
                        state === "expanded" || isMobile ? "size-9" : "size-8",
                      )}
                    >
                      {memberRoleShortName.slice(0, 2).toUpperCase()}
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
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-full"
                >
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
      </Sidebar>
    </PortalToApp>
  );
};

export default AdminSidebar;
