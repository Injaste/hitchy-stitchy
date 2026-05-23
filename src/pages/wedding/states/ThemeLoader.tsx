import { useEffect, useRef, type FC } from "react";
import { animate, motion, stagger } from "framer-motion";
import LottieRaw from "lottie-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Lottie = (LottieRaw as any).default ?? LottieRaw;
import SplitType from "split-type";
import loveParticle from "@/assets/lottie/love-particle.json";

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
      types: "words,chars",
      tagName: "span",
      wordClass: "inline-block",
    });

    const chars = Array.from(
      (headingRef.current as HTMLElement).querySelectorAll<HTMLElement>(
        ".char",
      ),
    );
    animate(
      chars,
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
          <span className="flex items-center gap-2 text-sm tracking-widest text-primary font-serif italic">
            Hitchy Stitchy
          </span>
          <div className="-my-6">
            <Lottie
              animationData={loveParticle}
              loop
              style={{ width: 80, height: 80 }}
            />
          </div>
        </motion.div>

        {/* Heading Section with Split-Type */}
        {/* <h1
          ref={headingRef}
          className="text-primary text-4xl md:text-6xl font-serif font-light leading-[1.1] sm:mb-3 text-balance"
        >
          <span className="overflow-hidden">The Celebration of</span>
          <i className="overflow-hidden">Our Eternal Love</i>
        </h1> */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // transition={{ duration: 1, delay: CONTENT_DELAY + 1.5 }}
          transition={{ duration: 1, delay: CONTENT_DELAY + 1 }}
          className="mt-10 flex flex-col items-center gap-4"
          onAnimationComplete={() => {
            animationDone.current = true;
            tryComplete();
          }}
        >
          <div className="h-px w-8 bg-accent/50" />

          <p className="text-2xs tracking-[0.3em] text-foreground uppercase font-light">
            Please wait while we prepare your invitation
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeLoader;
