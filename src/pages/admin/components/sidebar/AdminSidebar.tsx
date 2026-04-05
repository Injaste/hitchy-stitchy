import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarHeart,
  Clock,
  CheckSquare,
  Users,
  Radio,
  ClipboardList,
  UserCog,
  Settings,
  LogOut,
  ChevronsUpDown,
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
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
            <CalendarHeart className="h-5 w-5 text-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {eventName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{slug}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
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
                icon={Radio}
                label="Live"
                to={`${base}/live`}
                isActive={activePage === "live"}
                badge={activeCue ? <PulseDot /> : undefined}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem
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
                />
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

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md p-1.5 hover:bg-muted transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {memberRoleShortName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {memberDisplayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {memberRoleName}
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <AdminLogout />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
