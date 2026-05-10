import { motion } from "framer-motion";
import {
  SidebarSeparator,
  SidebarTrigger,
  SidebarWidthIcon,
  SidebarWidth,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAdminStore } from "../store/useAdminStore";
import { useCueStore } from "../store/useCueStore";
import { usePingStore } from "../store/usePingStore";
import { useIsMobile } from "@/hooks/use-mobile";
import PortalToApp from "@/components/custom/portal-to-app";
import Container from "@/components/custom/container";
import { ActiveCueBanner } from "./ActiveCueBanner";

const AdminTopbar = () => {
  const { state } = useSidebar();
  const { slug } = useAdminStore();
  const isMobile = useIsMobile();
  const { activeCue, hasCue } = useCueStore();
  const openPing = usePingStore((s) => s.open);

  return (
    <PortalToApp>
      <motion.header
        initial={false}
        animate={{
          height: hasCue ? 56 : 0,
          opacity: hasCue ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-2 right-2 z-50 rounded-xl overflow-hidden shadow-sm ring-1 ring-sidebar-border bg-background transition-[left] duration-200 ease-linear"
        style={{
          left: isMobile
            ? 8
            : state === "collapsed"
              ? SidebarWidthIcon
              : SidebarWidth,
        }}
      >
        <div className="bg-background/50 backdrop-blur-md">
          <Container>
            <div className="flex items-center justify-between gap-3 h-14 px-4 lg:px-0">
              {isMobile && (
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="-mx-1" />
                  <SidebarSeparator
                    orientation="vertical"
                    className="mx-0 h-5 my-auto!"
                  />
                </div>
              )}

              <ActiveCueBanner />

              {/* <div className="flex items-center gap-2 shrink-0">
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
              </div> */}
            </div>
          </Container>
        </div>
      </motion.header>
    </PortalToApp>
  );
};

export default AdminTopbar;
