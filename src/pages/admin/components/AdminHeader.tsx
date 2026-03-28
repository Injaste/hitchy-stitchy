import { CalendarHeart, LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useLogoutMutation } from "@/pages/admin/auth/queries";

export function AdminHeader() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { teamRoles, currentRole, setCurrentRole } = useAdminStore();

  // logoutUser() dispatches auth:change → AuthGate swaps to <Login>.
  // onSuccess navigates to the invitation page so the URL also resets.
  const { mutate: doLogout, isPending: loggingOut } = useLogoutMutation({});

  const getAssigneeDisplay = (roleName: string) => {
    const role = teamRoles.find((r) => r.role === roleName);
    if (role) return `${role.shortRole} – ${role.names.join(" & ")}`;
    return roleName;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 md:py-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <CalendarHeart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-serif font-bold text-primary tracking-tight leading-none">
            Dan & Nad
          </h1>
          <p className="text-muted-foreground font-medium tracking-wide uppercase text-[8px] md:text-[10px] mt-0.5">
            Wedding Planning
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={currentRole} onValueChange={setCurrentRole}>
          <SelectTrigger size="sm" className="text-xs min-w-[120px]">
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
          size="icon-sm"
          onClick={() => doLogout()}
          disabled={loggingOut}
          title="Logout"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
