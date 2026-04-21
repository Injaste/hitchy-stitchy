import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import type { PublicEventConfig } from "@/pages/templates/types";

import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingIcons from "./FloatingIcons";
import PortalToApp from "@/components/custom/portal-to-app";

export interface ThemeProps {
  eventConfig: PublicEventConfig;
  pageConfig?: Record<string, unknown>;
}

const UniqueMuslim = ({ eventConfig, pageConfig }: ThemeProps) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const bgImage = (pageConfig?.background_image as string) ?? "/dannad.png";

  // WHY IS THIS COMPONENT RUNNING IN ADMIN DASHBOARD?
  console.log("asdasdad");

  return (
    <div ref={containerRef} className="font-medium">
      <motion.div
        className="fixed top-0 bottom-0 right-0 w-1 bg-primary z-50 origin-top"
        style={{ scaleY: scaleProgress }}
      />

      <PortalToApp>
        <img
          className="fixed inset-0 w-full h-full aspect-square object-contain opacity-50 -z-10 blur-sm"
          src={bgImage}
          alt=""
        />
        <FloatingIcons />
      </PortalToApp>

      <Hero eventConfig={eventConfig} />
      <Details eventConfig={eventConfig} />
      <RSVP eventConfig={eventConfig} />
    </div>
  );
};

export default UniqueMuslim;
