import {
  CalendarHeart,
  Clock,
  CheckSquare,
  Users,
  Radio,
  ClipboardList,
  UserCog,
  Settings,
  ChevronsUpDown,
  ShoppingCart,
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
import { useCueStore } from "../../store/useCueStore";
import useActivePage from "../../hooks/useActivePage";
import { isAdminMember } from "../../types";

import NavItem from "./NavItem";
import PulseDot from "./PulseDot";
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
  const { activeCue } = useCueStore();
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

        {/* <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                icon={CheckSquare}
                label="Checklist"
                to={`${base}/checklist`}
                isActive={activePage === "checklist"}
              />
              <NavItem
                icon={Users}
                label="Team"
                to={`${base}/team`}
                isActive={activePage === "team"}
              />
              <NavItem
                icon={ShoppingCart}
                label="Vendor"
                to={`${base}/vendor`}
                isActive={activePage === "vendor"}
              />
              <NavItem
                icon={Radio}
                label="Live"
                to={`${base}/live`}
                isActive={activePage === "live"}
                badge={activeCue ? <PulseDot /> : undefined}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        {showAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* <NavItem
                  icon={ClipboardList}
                  label="RSVPs"
                  to={`${base}/rsvp`}
                  isActive={activePage === "rsvp"}
                />
                <NavItem
                  icon={UserCog}
                  label="Users"
                  to={`${base}/users`}
                  isActive={activePage === "users"}
                /> */}
                <NavItem
                  icon={Settings}
                  label="Settings"
                  to={`${base}/settings`}
                  isActive={activePage === "settings"}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground capitalize">
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
