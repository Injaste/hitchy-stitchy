import {
  Clock,
  CheckSquare,
  Users,
  Shield,
  Mail,
  ClipboardList,
  Wallet,
  HandCoins,
  Settings,
} from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminStore } from "../../store/useAdminStore";
import { useAccess } from "../../hooks/useAccess";
import useActivePage from "../../hooks/useActivePage";
import { useEventSettingsStore } from "../../settings/useEventSettingsStore";
import NavItem from "../NavItem";

const AdminSidebarContent = () => {
  const { slug } = useAdminStore();
  const { canRead } = useAccess();
  const activePage = useActivePage();
  const { isMobile, setOpenMobile } = useSidebar();
  const openEventSettings = useEventSettingsStore((s) => s.open);
  const base = `/${slug}/admin`;

  const showTimeline = canRead("timeline");
  const showTasks = canRead("tasks");
  const showBudget = canRead("budget");
  const showGifts = canRead("gifts");
  // The member roster is viewable by every active member; managing it needs members:full.
  const showMembers = true;
  const showAccess = canRead("access");
  const showGuests = canRead("guests");
  const showInvitation = canRead("invitation");

  const hasOperations = showTimeline || showTasks;
  const hasMoney = showBudget || showGifts;
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
                    label="Budget"
                    to={`${base}/budget`}
                    isActive={activePage === "budget"}
                  />
                )}
                {showGifts && (
                  <NavItem
                    icon={HandCoins}
                    label="Gifts"
                    to={`${base}/gifts`}
                    isActive={activePage === "gifts"}
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
            {/* A modal trigger, not a route — no isActive (the route-keyed slide
                indicator never covers it, and data-active alone would flip the
                text to the light "on-primary" color over no background). */}
            <SidebarMenuItem id="settings">
              <SidebarMenuButton
                variant="ghost"
                tooltip="Event settings"
                className="cursor-pointer"
                onClick={() => {
                  openEventSettings();
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <Settings className="h-4 w-4" />
                <span>Event settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};

export default AdminSidebarContent;
