import { motion } from "framer-motion";
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
import { useActiveTimelineQuery } from "../timeline/queries";

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
        className="fixed top-2 right-2 z-50 rounded-2xl overflow-hidden shadow-sm ring-1 ring-sidebar-border bg-background transition-[left]"
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
            <div className="flex items-center justify-between gap-3 h-14 p-2">
              {isMobile && (
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="-mx-1" />
                  <SidebarSeparator
                    orientation="vertical"
                    className="mx-0 h-5 my-auto!"
                  />
                </div>
              )}

            </div>
          </Container>
        </div>
      </motion.header>
    </PortalToApp>
  );
};

export default AdminTopbar;
