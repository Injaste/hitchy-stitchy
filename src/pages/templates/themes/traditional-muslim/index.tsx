import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingIcons from "./FloatingIcons";
import PortalToApp from "@/components/custom/portal-to-app";
import type { ThemeProps } from "@/pages/templates/themes/types";

const TraditionalMuslim = ({ eventConfig, pageConfig }: ThemeProps) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const config =
    pageConfig?._theme_slug === "traditional-muslim" ? pageConfig : undefined;
  const bgImage = config?.background_image ?? null;

  return (
    <div ref={containerRef} className="font-display">
      <motion.div
        className="fixed top-0 bottom-0 right-0 w-1 bg-primary z-50 origin-top"
        style={{ scaleY: scaleProgress }}
      />

      <PortalToApp>
        {bgImage ? (
          <img
            className="fixed inset-0 w-full h-full object-cover opacity-25 -z-10"
            src={bgImage}
            alt=""
          />
        ) : (
          <div className="fixed inset-0 -z-10 bg-linear-to-b from-card via-background to-card" />
        )}
        <FloatingIcons />
      </PortalToApp>

      <Hero eventConfig={eventConfig} />
      <Details eventConfig={eventConfig} />
      <RSVP eventConfig={eventConfig} />
    </div>
  );
};

export default TraditionalMuslim;
