import type { FC, ReactNode } from "react";
import { motion } from "framer-motion";

import Container from "@/components/custom/container";
import { useIsMobile } from "@/hooks/use-media-query";
import { useActiveTimelineQuery } from "../timeline/queries";
import { usePlan } from "../hooks/usePlan";
import { useAccess } from "../hooks/useAccess";
import ActiveCueBanner from "./ActiveCueBanner";
import LimitReachedBanner from "./LimitReachedBanner";

/** The animated header shell that reveals/collapses ONE banner above the admin
 *  content. Compose one per banner — they stack as flex siblings above the
 *  ScrollView. In-flow (not fixed); its animated height reserves/releases its own
 *  space, so SidebarInset needs no banner-based margin. */
const Topbar: FC<{ show: boolean; children: ReactNode }> = ({ show, children }) => {
  const isMobile = useIsMobile();
  return (
    <motion.header
      initial={false}
      animate={{
        height: show ? 56 : 0,
        opacity: show ? 1 : 0,
        marginBottom: show && !isMobile ? 8 : 0,
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative z-40 shrink-0 overflow-hidden md:rounded-2xl shadow-sm md:shadow-none ring-1 ring-sidebar-border bg-background"
    >
      <div className="flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-md">
        <Container>
          <div className="px-1 md:px-1.5">{children}</div>
        </Container>
      </div>
    </motion.header>
  );
};

/** Stacks the admin banners, each in its own independently-revealing Topbar.
 *  Order top→bottom: limit-reached, then the live-cue. */
const AdminTopbar = () => {
  const { data: active } = useActiveTimelineQuery();
  const { reachedLimits } = usePlan();
  // Limits are only actionable by whoever can pay, and plan UI is super-admin-
  // only — so don't even mount the banner for members (no DOM/a11y leak).
  const { isSuperAdmin } = useAccess();

  return (
    <>
      {isSuperAdmin && (
        <Topbar show={reachedLimits.length > 0}>
          <LimitReachedBanner />
        </Topbar>
      )}

      <Topbar show={!!active}>
        <ActiveCueBanner active={active} />
      </Topbar>
    </>
  );
};

export default AdminTopbar;
