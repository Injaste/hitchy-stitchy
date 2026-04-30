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

const AdminSidebar = () => {
  const {
    eventName,
    slug,
    memberDisplayName,
    memberRoleName,
    memberRoleShortName,
    isAdmin,
  } = useAdminStore();
  const activePage = useActivePage();

  const base = `/${slug}/admin`;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary-foreground">
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
                  <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-muted text-xs font-medium text-muted-foreground capitalize">
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
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem asChild>
                  <AdminLogout />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
