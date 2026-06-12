import { LogOut } from "lucide-react";
import Logo from "@/components/custom/logo";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useLogoutMutation } from "@/auth/queries";

import Container from "@/components/custom/container";

const DashboardTopbar = () => {
  const navigate = useNavigate();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  // Navigation stays at the call site, not inside useLogoutMutation, by design:
  // the post-logout destination is context-specific — the dashboard returns to
  // /login, while the admin sidebar returns to the public event page — so the
  // shared mutation can't own it. Logout's universal half (clearing the auth
  // cache) already lives in the data layer, via useAuthListener on SIGNED_OUT.
  // Rule: data/cache effects belong in the query hook; UI and routing belong
  // with the caller. Don't hoist this onSuccess into the hook.
  const handleLogout = () =>
    logout(undefined, {
      onSuccess: () => navigate("/login", { replace: true }),
    });

  return (
    <header className="border-b border-border/60">
      <Container>
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo
              imageClassName="w-12 h-12 -mb-3"
              brandClassName="text-base font-bold"
              showBrand
              direction="row"
            />
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground gap-1.5"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          </Button>
        </div>
      </Container>
    </header>
  );
};

export default DashboardTopbar;
