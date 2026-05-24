import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/custom/logo";

import ShareRow from "./ShareRow";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 md:px-12 py-12 flex flex-col items-center gap-10">
      <ShareRow />

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo
          imageClassName="w-5 h-5"
          brandClassName="text-sm"
          showName
          direction="row"
        />
        <p className="text-xs text-muted-foreground text-center">
          Crafted with love for couples who care about every detail.
        </p>
        <div className="flex items-center gap-2">
          <Link to="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
