import {
  CalendarDays,
  CheckSquare,
  Users,
  Radio,
  Mail,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import { CalendarHeart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/sidebar";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useLogoutMutation } from "@/pages/admin/auth/queries";

export function AdminSidebar() {
  const { activePage, setActivePage, teamRoles, currentRole, setCurrentRole, eventConfig } =
    useAdminStore();
  const { activeCueEvent } = useCueStore();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin ?? false;

  const { mutate: doLogout, isPending: loggingOut } = useLogoutMutation({
    onSuccess: () => navigate(slug ? `/${slug}` : "/"),
  });

  const getAssigneeDisplay = (roleName: string) => {
    const role = teamRoles.find((r) => r.role === roleName);
    if (role) return `${role.shortRole} – ${role.names.join(" & ")}`;
    return roleName;
  };

  const navItemClass = (...pages: string[]) =>
    cn(
      "transition-colors w-full",
      pages.includes(activePage)
        ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <Sidebar collapsible="offcanvas">
      {/* ── Brand ── */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <CalendarHeart className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-serif font-bold text-primary leading-none truncate">
              Dan &amp; Nad
            </p>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
              Wedding Admin
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* ── Timeline ── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActivePage(eventConfig.days[0]?.id ?? "day-1")}
                  className={navItemClass(...eventConfig.days.map((d) => d.id))}
                >
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span>Timeline</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Operations ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActivePage("checklist")}
                  className={navItemClass("checklist")}
                >
                  <CheckSquare className="h-4 w-4 shrink-0" />
                  <span>Tasks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActivePage("team")}
                  className={navItemClass("team")}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Team</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActivePage("live")}
                  className={navItemClass("live")}
                >
                  <Radio className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Live</span>
                  {activeCueEvent && (
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Admin (isAdmin only) ── */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActivePage("rsvps")}
                    className={navItemClass("rsvps")}
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>RSVPs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActivePage("users")}
                    className={navItemClass("users")}
                  >
                    <UserCog className="h-4 w-4 shrink-0" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActivePage("settings")}
                    className={navItemClass("settings")}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ── Footer: role selector + logout ── */}
      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-3">
        <Select value={currentRole} onValueChange={setCurrentRole}>
          <SelectTrigger size="sm" className="text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {teamRoles.map((r) => (
              <SelectItem key={r.role} value={r.role}>
                {getAssigneeDisplay(r.role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => doLogout()}
          disabled={loggingOut}
          className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          {loggingOut ? "Logging out…" : "Log out"}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground/60">
          Made with ❤️ for Dan &amp; Nad
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
