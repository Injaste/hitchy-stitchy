import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import type { PublicEventConfig } from "@/pages/templates/types";

import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingIcons from "./FloatingIcons";

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

  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const bgImage = (pageConfig?.background_image as string) ?? "/dannad.png";

  return (
    <div ref={containerRef} className="font-medium">
      <motion.div
        className="fixed top-0 bottom-0 right-0 w-1 bg-primary z-50 origin-top"
        style={{ scaleY: scaleProgress }}
      />

      <img
        className="fixed inset-0 w-full h-full aspect-square object-contain opacity-50"
        src={bgImage}
        alt=""
      />

      <Hero eventConfig={eventConfig} />
      <Details eventConfig={eventConfig} />
      <RSVP eventConfig={eventConfig} />
      <FloatingIcons />
    </div>
  );
};

export default UniqueMuslim;
