import {
  CalendarHeart,
  Clock,
  CheckSquare,
  Users,
  Shield,
  ChevronsUpDown,
  LayoutTemplate,
  ScrollText,
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
import { isAdminMember } from "../../types";

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
    memberRoleCategory,
  } = useAdminStore();
  const activePage = useActivePage();

  const showAdmin = isAdminMember(memberRoleCategory);
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
          <SidebarGroupLabel>Events</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                icon={Clock}
                label="Timeline"
                to={`${base}/timeline`}
                isActive={activePage === "timeline"}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
          <SidebarGroupLabel>Team</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* <NavItem
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
              /> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdmin && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Invitation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* <NavItem
                    icon={LayoutTemplate}
                    label="Pages"
                    to={`${base}/pages`}
                    isActive={activePage === "pages"}
                  />
                  <NavItem
                    icon={ScrollText}
                    label="Details"
                    to={`${base}/invitation`}
                    isActive={activePage === "invitation"}
                  />
                  <NavItem
                    icon={ClipboardList}
                    label="Guests"
                    to={`${base}/rsvp`}
                    isActive={activePage === "rsvp"}
                  /> */}
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
