import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useLogoutMutation } from "@/auth/queries";

import AccountAvatar from "./AccountAvatar";
import AccountSettingsModal from "../modals/AccountSettingsModal";
import { useProfileQuery } from "../queries";

/** Avatar dropdown for the account: opens account settings or signs out. Self-
 *  contained (owns the modal + logout), so any shell can drop it in — the
 *  dashboard topbar today, the admin sidebar later. */
const AccountMenu = () => {
  const navigate = useNavigate();
  const { data: profile } = useProfileQuery();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Navigation stays at the call site (not in useLogoutMutation): the dashboard
  // returns to /login. The mutation owns only the universal half (auth-cache
  // clear via useAuthListener on SIGNED_OUT).
  const handleLogout = () =>
    logout(undefined, {
      onSuccess: () => navigate("/login", { replace: true }),
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2">
          <AccountAvatar
            name={profile?.name}
            avatarUrl={profile?.avatar_url}
            size="lg"
          />
          <span className="sr-only">Open account menu</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">
              {profile?.name ?? "Your account"}
            </span>
            {profile?.email && (
              <span className="truncate text-xs font-normal text-muted-foreground">
                {profile.email}
              </span>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings />
            Account settings
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={isLoggingOut}
            onSelect={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <LogOut />
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  );
};

export default AccountMenu;
