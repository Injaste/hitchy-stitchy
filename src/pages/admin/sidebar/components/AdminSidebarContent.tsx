import {
  Clock,
  CheckSquare,
  Users,
  Shield,
  Mail,
  ClipboardList,
  Wallet,
  Settings,
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
import { useAccess } from "../../hooks/useAccess";
import useActivePage from "../../hooks/useActivePage";
import NavItem from "../NavItem";

const AdminSidebarContent = () => {
  const { slug } = useAdminStore();
  const { canRead } = useAccess();
  const activePage = useActivePage();
  const base = `/${slug}/admin`;

  const showTimeline = canRead("timeline");
  const showTasks = canRead("tasks");
  const showBudget = canRead("budget");
  // The member roster is viewable by every active member; managing it needs members:full.
  const showMembers = true;
  const showAccess = canRead("access");
  const showGuests = canRead("guests");
  const showInvitation = canRead("invitation") || canRead("themes");

  const hasOperations = showTimeline || showTasks;
  const hasMoney = showBudget;
  const hasTeam = showMembers || showAccess;
  const hasRSVP = showGuests || showInvitation;

  return (
    <SidebarContent activeId={activePage}>
      {hasOperations && (
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {showTimeline && (
                <NavItem
                  icon={Clock}
                  label="Timeline"
                  to={`${base}/timeline`}
                  isActive={activePage === "timeline"}
                />
              )}
              {showTasks && (
                <NavItem
                  icon={CheckSquare}
                  label="Tasks"
                  to={`${base}/tasks`}
                  isActive={activePage === "tasks"}
                />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {hasMoney && (
        <>
          <SidebarSeparator className="mx-4" />
          <SidebarGroup>
            <SidebarGroupLabel>Money</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {showBudget && (
                  <NavItem
                    icon={Wallet}
                    label="Budget Tracker"
                    to={`${base}/budget-tracker`}
                    isActive={activePage === "budget-tracker"}
                  />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      )}

      {hasTeam && (
        <>
          <SidebarSeparator className="mx-4" />
          <SidebarGroup>
            <SidebarGroupLabel>Teams</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {showMembers && (
                  <NavItem
                    icon={Users}
                    label="Members"
                    to={`${base}/members`}
                    isActive={activePage === "members"}
                  />
                )}
                {showAccess && (
                  <NavItem
                    icon={Shield}
                    label="Access"
                    to={`${base}/access`}
                    isActive={activePage === "access"}
                  />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      )}

      {hasRSVP && (
        <>
          <SidebarSeparator className="mx-4" />
          <SidebarGroup>
            <SidebarGroupLabel>RSVP</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {showInvitation && (
                  <NavItem
                    icon={Mail}
                    label="Invitation"
                    to={`${base}/invitation`}
                    isActive={activePage === "invitation"}
                  />
                )}
                {showGuests && (
                  <NavItem
                    icon={ClipboardList}
                    label="Guests"
                    to={`${base}/guests`}
                    isActive={activePage === "guests"}
                  />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      )}

      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            <NavItem
              icon={Settings}
              label="Settings"
              to={`${base}/settings`}
              isActive={activePage === "settings"}
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};

export default AdminSidebarContent;
