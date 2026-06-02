import { motion } from "framer-motion";
import { Bell, Link, Radio } from "lucide-react";
import {
  SidebarSeparator,
  SidebarTrigger,
  SidebarWidthIcon,
  SidebarWidth,
  useSidebar,
} from "@/components/ui/sidebar";

import { useIsMobile } from "@/hooks/use-mobile";
import PortalToApp from "@/components/custom/portal-to-app";
import Container from "@/components/custom/container";
import ActiveCueBanner from "./ActiveCueBanner";
import { useActiveTimelineQuery } from "../timeline/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AdminTopbar = () => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const { data: active } = useActiveTimelineQuery();
  const hasCue = !!active;

  return (
    <PortalToApp>
      <motion.header
        initial={false}
        animate={{
          height: hasCue ? 56 : 0,
          opacity: hasCue ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed top-0 md:top-2 right-0 md:right-2 z-50 md:rounded-2xl overflow-hidden bg-background ring-1 ring-sidebar-border transition-all",
          isMobile && "shadow-sm",
        )}
        style={{
          left: isMobile
            ? 0
            : state === "collapsed"
              ? SidebarWidthIcon
              : SidebarWidth,
        }}
      >
        <div className="bg-background/50 backdrop-blur-md">
          <Container>
            <div className="flex items-center justify-between gap-3 h-14 px-4 lg:px-0">
              <ActiveCueBanner active={active} />

              {/* <div className="ml-auto flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                  <Link to={`/admin/live`}>
                    {hasCue ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        <span className="max-w-[120px] truncate">
                          {active!.title}
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
              </div> */}
            </div>
          </Container>
        </div>
      </motion.header>
    </PortalToApp>
  );
};

export default AdminTopbar;
