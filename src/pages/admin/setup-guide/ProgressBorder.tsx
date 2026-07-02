import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

import { cn } from "@/lib/utils";

const SW = 3; // ring stroke width (px)

// A rounded-rect border path + its perimeter — same methodology as SubmitButton's
// border arc, generalised to any measured size/corner radius.
function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}
function roundedRectPerimeter(w: number, h: number, r: number) {
  return 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
}

// A celebratory burst from the widget's corner, fired once when the guide is
// completed. Same library as the RSVP success confetti.
function celebrate() {
  confetti({
    particleCount: 120,
    spread: 70,
    startVelocity: 38,
    angle: 110,
    origin: { x: 0.92, y: 0.9 },
  });
}

/** Draws the progress as the BORDER of its positioned parent. Measures the parent
 *  (size + corner radius) so the radius/length are computed exactly, then fills
 *  `pct` of the perimeter — the SubmitButton approach, used as a progress meter.
 *  On completion the grey track fills to primary and the arc turns success and
 *  redraws itself from zero, with a one-shot confetti burst. */
export function ProgressBorder({ pct }: { pct: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0, br: 0 });

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const measure = () =>
      setDims({
        w: parent.offsetWidth,
        h: parent.offsetHeight,
        br: parseFloat(getComputedStyle(parent).borderTopLeftRadius) || 0,
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const { w, h, br } = dims;
  const inset = SW / 2;
  const W = Math.max(0, w - SW);
  const H = Math.max(0, h - SW);
  const r = Math.max(0, Math.min(br - inset, Math.min(W, H) / 2));
  const d = w && h ? roundedRectPath(inset, inset, W, H, r) : "";
  const P = roundedRectPerimeter(W, H, r) || 1;
  const clamped = Math.max(0, Math.min(1, pct));
  const complete = clamped >= 1;

  // Fire the celebration once, when the guide flips from in-progress to complete
  // (not on a mount that is already complete — e.g. re-expanding a done guide).
  const wasComplete = useRef(complete);
  useEffect(() => {
    if (complete && !wasComplete.current) celebrate();
    wasComplete.current = complete;
  }, [complete]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full z-20"
    >
      {d && (
        <>
          {/* Track: faint grey while working; fills to primary on completion. */}
          <path
            d={d}
            strokeWidth={SW}
            className={cn(
              "transition-all duration-500",
              complete ? "stroke-primary opacity-100" : "stroke-current opacity-15",
            )}
          />
          {/* Arc: primary while filling; on completion it becomes success and
              redraws from zero over the primary track — the celebration. Keyed so
              entering `complete` remounts it and restarts the draw. */}
          <motion.path
            key={complete ? "done" : "progress"}
            d={d}
            strokeWidth={SW}
            strokeLinecap="round"
            className={complete ? "stroke-success" : "stroke-primary"}
            strokeDasharray={P}
            initial={complete ? { strokeDashoffset: P } : false}
            animate={{ strokeDashoffset: complete ? 0 : P * (1 - clamped) }}
            transition={
              complete
                ? { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
                : { type: "spring", stiffness: 80, damping: 18 }
            }
          />
        </>
      )}
    </svg>
  );
}
