import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const OPEN_DURATION_S = 2;
const HOLD_MS = 1200;
const EASE = [0.7, 0, 0.2, 1] as const;

const leftHalfVariants: Variants = {
  sealed: { x: "0%" },
  opening: {
    x: "-100%",
    transition: { duration: OPEN_DURATION_S, ease: EASE, delay: 0.35 },
  },
};

const rightHalfVariants: Variants = {
  sealed: { x: "0%" },
  opening: {
    x: "100%",
    transition: { duration: OPEN_DURATION_S, ease: EASE, delay: 0.35 },
  },
};

const stampVariants: Variants = {
  sealed: {
    opacity: 1,
    scale: 1,
    rotate: -6,
  },
  opening: {
    opacity: 0,
    scale: 1.35,
    rotate: -6,
    transition: { duration: 1, ease: "easeOut" },
  },
};

type Props = {
  loaderReady: boolean;
  onExitComplete: () => void;
};

const EnvelopeHalf = ({ side }: { side: "left" | "right" }) => {
  const isLeft = side === "left";
  const innerX = isLeft ? 100 : 0;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1={innerX}
        y1={0}
        x2={innerX}
        y2={100}
        className="stroke-(--um-fg)/50"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const EnvelopePreloader = ({ loaderReady, onExitComplete }: Props) => {
  const [phase, setPhase] = useState<"sealed" | "opening">("sealed");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflow = visible ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [visible]);

  useEffect(() => {
    if (!loaderReady) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;

      setPhase("opening");

      // let complete execute when animation is 50% complete
      setTimeout(onExitComplete, (OPEN_DURATION_S * 1000) / 2);
    }, HOLD_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loaderReady]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-100 pointer-events-none"
          exit={{ opacity: 0, transition: { duration: 0.001 } }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-(--um-envelope) overflow-hidden"
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
            className="absolute inset-y-0 right-0 w-1/2 bg-(--um-envelope) overflow-hidden"
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
            <div className="relative size-28 sm:size-36 rounded-full bg-(--um-primary) shadow-xl p-6 flex items-center justify-center">
              <img
                src="/images/background/d-n-n.png"
                alt=""
                className="w-full h-full object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <div className="absolute inset-1 rounded-full border border-dashed border-white pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnvelopePreloader;
