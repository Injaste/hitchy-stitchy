import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

// ─── Tweak this to test the opening speed ────────────────────────────────────
const OPEN_DURATION = 0.3; // seconds — change this value to adjust open speed
// ─────────────────────────────────────────────────────────────────────────────

const HOLD_MS = 700;
const EASE = [0.7, 0, 0.2, 1] as const;

const leftHalfVariants: Variants = {
  sealed: { x: "0%" },
  opening: {
    x: "-100%",
    transition: { duration: OPEN_DURATION, ease: EASE, delay: 0.35 },
  },
};

const rightHalfVariants: Variants = {
  sealed: { x: "0%" },
  opening: {
    x: "100%",
    transition: { duration: OPEN_DURATION, ease: EASE, delay: 0.35 },
  },
};

const stampVariants: Variants = {
  sealed: { opacity: 1, scale: 1, rotate: -6 },
  opening: {
    opacity: 0,
    scale: 1.35,
    rotate: -6,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

type Props = {
  loaderReady: boolean;
  onExitComplete: () => void;
};

const EnvelopeHalf = ({ side }: { side: "left" | "right" }) => {
  const isLeft = side === "left";
  const outerX = isLeft ? 0 : 100;
  const innerX = isLeft ? 100 : 0;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={`paper-shade-${side}`}
          x1={String(outerX / 100)}
          y1="0.5"
          x2={String(innerX / 100)}
          y2="0.5"
        >
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon
        points={`${outerX},0 ${outerX},100 ${innerX},50`}
        fill={`url(#paper-shade-${side})`}
        className="text-foreground"
      />

      <line
        x1={outerX}
        y1={0}
        x2={innerX}
        y2={50}
        className="stroke-primary/30"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      <line
        x1={outerX}
        y1={100}
        x2={innerX}
        y2={50}
        className="stroke-primary/30"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      <line
        x1={innerX}
        y1={0}
        x2={innerX}
        y2={100}
        className="stroke-foreground/10"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const EnvelopePreloader = ({ loaderReady, onExitComplete }: Props) => {
  const [phase, setPhase] = useState<"sealed" | "opening">("sealed");
  const [visible, setVisible] = useState(true);

  // Lock scrollbar for the duration of the preloader so the page doesn't
  // jump or show a scrollbar while the envelope is covering the viewport.
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!loaderReady) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setPhase("opening");
    }, HOLD_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loaderReady]);

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none"
          exit={{ opacity: 0, transition: { duration: 0.001 } }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-background overflow-hidden"
            variants={leftHalfVariants}
            initial="sealed"
            animate={phase}
            onAnimationComplete={() => {
              if (phase === "opening") setVisible(false);
            }}
          >
            <EnvelopeHalf side="left" />
          </motion.div>

          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-background overflow-hidden"
            variants={rightHalfVariants}
            initial="sealed"
            animate={phase}
          >
            <EnvelopeHalf side="right" />
          </motion.div>

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            variants={stampVariants}
            initial="sealed"
            animate={phase}
          >
            <div className="relative size-28 sm:size-36 rounded-full border-2 border-primary/50 bg-background shadow-xl p-2 flex items-center justify-center">
              <img
                src="/dannad.png"
                alt=""
                className="w-full h-full object-contain rounded-full"
              />
              <div className="absolute inset-1 rounded-full border border-primary/20 pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnvelopePreloader;
