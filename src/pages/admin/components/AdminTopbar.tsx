import { motion } from "framer-motion";
import Container from "@/components/custom/container";
import { useActiveTimelineQuery } from "../timeline/queries";
import ActiveCueBanner from "./ActiveCueBanner";
import { useIsMobile } from "@/hooks/use-media-query";

const AdminTopbar = () => {
  const isMobile = useIsMobile();
  const { data: active } = useActiveTimelineQuery();
  const hasCue = !!active;

  return (
    // In-flow (not fixed): the topbar is a flex sibling above the ScrollView, so it
    // stays put without fixed positioning — it lives outside the scroll container.
    // Its animated height reserves/releases its own space, so SidebarInset no longer
    // needs a cue-based marginTop to make room.
    <motion.header
      initial={false}
      animate={{
        height: hasCue ? 56 : 0,
        opacity: hasCue ? 1 : 0,
        marginBottom: hasCue && !isMobile ? 8 : 0,
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative z-40 shrink-0 overflow-hidden md:rounded-2xl shadow-sm md:shadow-none ring-1 ring-sidebar-border bg-background"
    >
      <div className="flex justify-center items-center h-full w-full bg-background/50 backdrop-blur-md">
        <Container>
          <div className="px-1 md:px-1.5">
            <ActiveCueBanner active={active} />
          </div>
        </Container>
      </div>
    </motion.header>
  );
};

export default AdminTopbar;
