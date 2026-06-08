import { createPortal } from "react-dom";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useCardFly } from "../hooks/useCardFly";

const RING_CLASS = {
  success: "ring-2 ring-success",
  destructive: "ring-2 ring-destructive",
} as const;

/**
 * Renders the flying clone for an in-flight card move (see useCardFly). Mounted
 * once on the tasks page; portals to <body> so it sits above the lanes and isn't
 * clipped by their overflow. While `to` is null the clone is lifted in place
 * (below an open modal); once `to` lands it springs across, then clears.
 */
const CardFlyOverlay = () => {
  const flight = useCardFly((s) => s.flight);
  const clear = useCardFly((s) => s.clear);

  if (!flight) return null;

  const { from, to, html, key, ring, radius } = flight;
  const dx = to ? to.left - from.left : 0;
  const dy = to ? to.top - from.top : 0;

  return createPortal(
    <motion.div
      key={key}
      aria-hidden
      className={cn(
        "pointer-events-none fixed shadow-lg transition-shadow",
        to ? "z-60" : "z-30",
        ring && RING_CLASS[ring],
      )}
      style={{
        top: from.top,
        left: from.left,
        width: from.width,
        height: from.height,
        borderRadius: radius,
      }}
      initial={{ x: 0, y: 0, scale: 1.03 }}
      animate={{ x: dx, y: dy, scale: to ? 1 : 1.03 }}
      transition={{ type: "spring", stiffness: 240, damping: 34 }}
      onAnimationComplete={() => {
        if (to) clear();
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />,
    document.body,
  );
};

export default CardFlyOverlay;
