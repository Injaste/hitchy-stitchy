import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingIcons from "./FloatingIcons";
import PortalToApp from "@/components/custom/portal-to-app";
import type { ThemeProps } from "@/pages/templates/themes/types";

const UniqueMuslim = ({ eventConfig, pageConfig }: ThemeProps) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const config = pageConfig?._theme_slug === "unique-muslim" ? pageConfig : undefined;
  const bgImage = config?.background_image ?? "/dannad.png";

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

      <Hero eventConfig={eventConfig} pageConfig={pageConfig} />
      <Details eventConfig={eventConfig} pageConfig={pageConfig} />
      <RSVP eventConfig={eventConfig} />
    </div>
  );
};

export default UniqueMuslim;
