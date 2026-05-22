import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const HOLD_MS = 700;
const EASE = [0.7, 0, 0.2, 1] as const;

const leftHalfVariants: Variants = {
  sealed: { x: "0%" },
  opening: {
    x: "-100%",
    transition: { duration: 1.1, ease: EASE, delay: 0.35 },
  },
};

const rightHalfVariants: Variants = {
  sealed: { x: "0%" },
  opening: {
    x: "100%",
    transition: { duration: 1.1, ease: EASE, delay: 0.35 },
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
  onExitComplete: () => void;
};

// envelope rotated so the flap V points LEFT:
//   - flap occupies the RIGHT half of the viewport (V edges go from top-right
//     and bottom-right corners inward to the center seam)
//   - body bottom-flap occupies the LEFT half (mirror — V edges go from
//     top-left and bottom-left corners inward to the center seam)
// the split is still vertical at x = 50%, so each half is a vertical strip.
const EnvelopeHalf = ({ side }: { side: "left" | "right" }) => {
  const isLeft = side === "left";
  // in local coords (0..100 wide, 0..100 tall) for this half:
  //   outerX = the edge away from the seam (viewport edge)
  //   innerX = the edge touching the seam (viewport center)
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

      {/* triangular face — the V area pointing toward the seam */}
      <polygon
        points={`${outerX},0 ${outerX},100 ${innerX},50`}
        fill={`url(#paper-shade-${side})`}
        className="text-foreground"
      />

      {/* upper diagonal fold (outer-top corner → seam center) */}
      <line
        x1={outerX}
        y1={0}
        x2={innerX}
        y2={50}
        className="stroke-primary/30"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* lower diagonal fold (outer-bottom corner → seam center) */}
      <line
        x1={outerX}
        y1={100}
        x2={innerX}
        y2={50}
        className="stroke-primary/30"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* seam edge — soft vertical line where the halves meet */}
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

const EnvelopePreloader = ({ onExitComplete }: Props) => {
  const [phase, setPhase] = useState<"sealed" | "opening">("sealed");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const start = () => {
      if (cancelled) return;
      timer = setTimeout(() => {
        if (!cancelled) setPhase("opening");
      }, HOLD_MS);
    };

    if (document.readyState === "complete") {
      start();
      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      };
    }

    const onReady = () => {
      if (document.readyState === "complete") {
        document.removeEventListener("readystatechange", onReady);
        start();
      }
    };
    document.addEventListener("readystatechange", onReady);
    return () => {
      cancelled = true;
      document.removeEventListener("readystatechange", onReady);
      if (timer) clearTimeout(timer);
    };
  }, []);

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
