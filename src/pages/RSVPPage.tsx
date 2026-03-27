import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { BackgroundDecor } from "@/components/BackgroundElements";
import { Hero } from "@/components/Hero";
import { Details } from "@/components/Details";
import { RSVPForm } from "@/components/RSVPForm";

export default function RSVPPage() {
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
    <div
      ref={containerRef}
      className="bg-sage-50 text-sage-900 font-serif selection:bg-gold-500/30 overflow-x-hidden min-h-screen"
    >
      <motion.div
        className="fixed top-0 bottom-0 right-0 w-1 bg-gold-500 z-50 origin-top"
        style={{ scaleY: scaleProgress }}
      />

      <img
        className="fixed inset-0 w-full h-full aspect-square object-contain opacity-50"
        src="/dannad.png"
        alt="dannad"
      />

      <BackgroundDecor />
      <Hero />
      <Details />
      <RSVPForm />
    </div>
  );
}
