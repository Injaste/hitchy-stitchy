import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import Hero from "./Hero";
import Details from "./Details";
import RSVP from "./RSVP";
import FloatingHearts from "./FloatingHearts";

const Invitation = () => {
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

      <Hero />
      <Details />
      <RSVP />
      <FloatingHearts />
    </div>
  );
};

export default Invitation;
