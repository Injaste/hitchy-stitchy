import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import PortalToApp from "@/components/custom/portal-to-app";
import type { ThemeProps } from "@/pages/templates/themes/types";

const MinimalisticMuslim = ({ eventConfig, pageConfig }: ThemeProps) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="font-sans">
      <motion.div
        className="fixed top-0 bottom-0 right-0 w-px bg-foreground/30 z-50 origin-top"
        style={{ scaleY: scaleProgress }}
      />

      <PortalToApp>
        <div className="fixed inset-0 -z-10 bg-background" />
      </PortalToApp>

      <Hero eventConfig={eventConfig} pageConfig={pageConfig} />
      <Details eventConfig={eventConfig} />
      <RSVP eventConfig={eventConfig} />
    </div>
  );
};

export default MinimalisticMuslim;
