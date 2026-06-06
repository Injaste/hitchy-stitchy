import { motion } from "framer-motion";
import Container from "@/components/custom/container";
import { useActiveTimelineQuery } from "../timeline/queries";
import ActiveCueBanner from "./ActiveCueBanner";

const AdminTopbar = () => {
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
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="shrink-0 overflow-hidden sm:rounded-2xl shadow-sm sm:shadow-none ring-1 ring-sidebar-border bg-background"
    >
      <div className="flex justify-center items-center h-full w-full bg-background/50 backdrop-blur-md">
        <Container>
          <div className="px-1 sm:px-1.5">
            <ActiveCueBanner active={active} />
          </div>
        </Container>
      </div>
    </motion.header>
  );
};

export default AdminTopbar;
