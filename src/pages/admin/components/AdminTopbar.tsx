import { motion } from "framer-motion";
import {
  SidebarWidthIcon,
  SidebarWidth,
  useSidebar,
} from "@/components/ui/sidebar";

import { useIsMobile } from "@/hooks/use-mobile";
import PortalToApp from "@/components/custom/portal-to-app";
import Container from "@/components/custom/container";
import { useActiveTimelineQuery } from "../timeline/queries";
import ActiveCueBanner from "./ActiveCueBanner";

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
        className="fixed top-0 sm:top-2 right-0 sm:right-2 z-50 sm:rounded-2xl overflow-hidden shadow-sm sm:shadow-none ring-1 ring-sidebar-border bg-background transition-[left]"
        style={{
          left: isMobile
            ? 0
            : state === "collapsed"
              ? SidebarWidthIcon
              : SidebarWidth,
        }}
      >
        <div className="flex justify-center items-center h-full w-full bg-background/50 backdrop-blur-md">
          <Container>
            <div className="sm:px-2">
              <ActiveCueBanner active={active} />
            </div>
          </Container>
        </div>
      </motion.header>
    </PortalToApp>
  );
};

export default AdminTopbar;
