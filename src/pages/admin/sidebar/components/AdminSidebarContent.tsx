import {
  Clock,
  CheckSquare,
  Users,
  KeyRound,
  Mail,
  ClipboardList,
} from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAdminStore } from "../../store/useAdminStore";
import useActivePage from "../../hooks/useActivePage";
import NavItem from "../NavItem";

const AdminSidebarContent = () => {
  const { slug, isSuperAdmin } = useAdminStore();
  const activePage = useActivePage();
  const base = `/${slug}/admin`;

  return (
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
              icon={KeyRound}
              label="Role Access"
              to={`${base}/roles`}
              isActive={activePage === "roles"}
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {isSuperAdmin && (
        <>
          <SidebarSeparator className="mx-4" />

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
  );
};

export default AdminSidebarContent;
