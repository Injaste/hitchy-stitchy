import { useEffect, useRef, type FC } from "react";
import { animate, motion, stagger } from "framer-motion";
import { CalendarHeart, Heart } from "lucide-react";
import SplitType from "split-type";
import PortalToApp from "@/components/custom/portal-to-app";

const CONTENT_DELAY = 0.8;

const ThemeLoader: FC<{ loadedCompleted: () => void }> = ({
  loadedCompleted,
}) => {
  const headingRef = useRef(null);
  const animationDone = useRef(false);

  const tryComplete = () => {
    if (!animationDone.current) return;
    if (document.readyState === "complete") {
      loadedCompleted();
    } else {
      window.addEventListener("load", loadedCompleted, { once: true });
    }
  };

  useEffect(() => {
    if (!headingRef.current) return;

    // 1. Split the text
    const text = new SplitType(headingRef.current, {
      types: "chars",
      tagName: "span",
    });

    // 2. Animate the injected ".char" nodes using Framer's imperative API
    animate(
      ".char",
      { y: [100, 0], rotateZ: [10, 0] },
      {
        delay: stagger(0.03, { startDelay: CONTENT_DELAY + 0.5 }),
        duration: 1,
        ease: [0.2, 1, 0.3, 1],
      },
    );

    return () => text.revert();
  }, []);

  return (
    <div>
      {/* 2. BACKGROUND ELEGANCE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 bg-radial from-accent/20 via-transparent to-transparent"
      />

      {/* 3. CONTENT */}
      <div className="relative flex flex-col items-center px-12 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: CONTENT_DELAY }}
          className="flex flex-col items-center justify-center gap-4 mb-8"
        >
          <span className="flex items-center gap-2 text-sm tracking-widest text-accent/60 font-serif italic">
            Hitchy Stitchy
          </span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Heart size={32} strokeWidth={1.5} className="text-accent/50" />
          </motion.div>
        </motion.div>

        {/* Heading Section with Split-Type */}
        <h1
          ref={headingRef}
          className="text-primary text-4xl md:text-6xl font-serif font-light leading-[1.1] sm:mb-3"
        >
          <span className="overflow-hidden">The Celebration of</span>
          <i className="overflow-hidden">Our Eternal Love</i>
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: CONTENT_DELAY + 1.5 }}
          className="mt-10 flex flex-col items-center gap-4"
          onAnimationComplete={() => {
            animationDone.current = true;
            tryComplete();
          }}
        >
          <div className="h-px w-8 bg-accent/50" />

          <p className="text-2xs tracking-[0.3em] text-primary-900/40 uppercase font-light">
            Please wait while we prepare your invitation
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeLoader;
