import { LogOut } from "lucide-react";
import Logo from "@/components/custom/logo";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useLogoutMutation } from "@/auth/queries";

import Container from "@/components/custom/container";

const DashboardTopbar = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
      <Container>
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo
              imageClassName="w-8 h-8"
              brandClassName="text-base font-bold"
              showBrand
              direction="row"
            />
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground gap-1.5"
            onClick={() => logout({})}
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
