import { Link } from "react-router-dom";
import { Bell, Radio } from "lucide-react";
import {
  SidebarSeparator,
  SidebarTrigger,
  SidebarWidth,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useAdminStore } from "../store/useAdminStore";
import { useCueStore } from "../store/useCueStore";
import { usePingStore } from "../store/usePingStore";
import useActivePage from "../hooks/useActivePage";
import { useIsMobile } from "@/hooks/use-mobile";
import PortalToApp from "@/components/custom/portal-to-app";

const formatPageLabel = (page: string): string => {
  return page.replaceAll("-", " ");
};

const AdminTopbar = () => {
  const { slug } = useAdminStore();
  const isMobile = useIsMobile();
  const { activeCue } = useCueStore();
  const openPing = usePingStore((s) => s.open);
  const activePage = useActivePage();

  const pageLabel = formatPageLabel(activePage);
  const hasCue = !!activeCue;

  return (
    <PortalToApp>
      <header
        className="fixed top-0 right-0 z-50"
        style={{ left: isMobile ? 0 : SidebarWidth }}
      >
        <div className="flex items-center justify-between gap-3 bg-background border-b border-border px-4 h-14 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
              <>
                <SidebarTrigger className="-mx-1" />
                <SidebarSeparator
                  orientation="vertical"
                  className="mx-0 h-5 my-auto!"
                />
              </>
            )}
            <h1 className="text-sm font-semibold text-foreground capitalize">
              {pageLabel}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => openPing()}
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "shrink-0 gap-2 text-xs",
                hasCue
                  ? "bg-destructive/10 text-destructive border border-destructive/30 rounded-full hover:bg-destructive/15"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Link to={`/${slug}/admin/live`}>
                {hasCue ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    <span className="max-w-[120px] truncate">
                      {activeCue!.title}
                    </span>
                  </>
                ) : (
                  <>
                    <Radio className="h-3.5 w-3.5" />
                    <span>Live</span>
                  </>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </PortalToApp>
  );
};

export default AdminTopbar;
