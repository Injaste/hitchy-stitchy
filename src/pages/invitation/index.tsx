import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { CalendarHeart } from "lucide-react";

import { usePublicEvent } from "./queries";
import type { PublicEventConfig } from "./types";

import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingIcons from "./FloatingIcons";

const InvitationSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen bg-background flex items-center justify-center"
  >
    <CalendarHeart className="w-10 h-10 text-primary animate-pulse" />
  </motion.div>
);

const InvitationError = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4">
    <p className="text-sm text-muted-foreground italic">
      This invitation could not be found.
    </p>
  </div>
);

const InvitationContent = ({
  eventConfig,
}: {
  eventConfig: PublicEventConfig;
}) => {
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

  return (
    <div ref={containerRef} className="font-medium">
      <motion.div
        className="fixed top-0 bottom-0 right-0 w-1 bg-primary z-50 origin-top"
        style={{ scaleY: scaleProgress }}
      />

      <img
        className="fixed inset-0 w-full h-full aspect-square object-contain opacity-50"
        src="/dannad.png"
        alt="dannad"
      />

      <Hero eventConfig={eventConfig} />
      <Details eventConfig={eventConfig} />
      <RSVP eventConfig={eventConfig} />
      <FloatingIcons />
    </div>
  );
};

const Invitation = () => {
  const { data: eventConfig, isLoading, error } = usePublicEvent();

  console.log(eventConfig);
  console.log(error);
  console.log(isLoading);

  if (isLoading) return <InvitationSkeleton />;
  if (error || !eventConfig) return <InvitationError />;

  return <InvitationContent eventConfig={eventConfig} />;
};

export default Invitation;
