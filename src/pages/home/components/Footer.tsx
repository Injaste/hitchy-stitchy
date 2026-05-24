import { Link } from "react-router-dom";
import { CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

import ShareRow from "./ShareRow";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 md:px-12 py-12 flex flex-col items-center gap-10">
      <ShareRow />

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarHeart className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground text-sm">Hitchy Stitchy</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Crafted with love for couples who care about every detail.
        </p>
        <div className="flex items-center gap-2">
          <Link to="/signup">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sign up
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
