import { motion } from "framer-motion";
import { CalendarHeart, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useLogoutMutation } from "@/auth/queries";

import Container from "@/components/custom/container";

const DashboardTopbar = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60 flex items-center justify-between">
      <Container className="flex justify-between items-center px-6 md:px-10 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <CalendarHeart className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-foreground text-base leading-none">
            Hitchy Stitchy
          </span>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground gap-1.5"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </span>
        </Button>
      </Container>
    </header>
  );
};

export default DashboardTopbar;
