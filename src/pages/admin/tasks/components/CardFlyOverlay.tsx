import { type FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";
import { Z } from "@/lib/z-index";
import { type Flight, cardEl, rectOf, useCardFly } from "../hooks/useCardFly";

const RING_CLASS = {
  success: "ring-2 ring-success",
  destructive: "ring-2 ring-destructive",
} as const;

const SPRING = { stiffness: 240, damping: 34 } as const;

/**
 * One flying clone. Its transform is driven by framer motion values (springs),
 * NOT React state — the chase loop writes the target imperatively each frame, so
 * nothing re-renders while it flies. While `landed` is false it sits lifted in
 * place (below an open modal); once landed it chases the real card's live
 * viewport rect each frame (so a mid-flight board scroll can't leave it at a
 * stale target) and springs across, then clears itself once settled. Each clone
 * owns its own loop + springs, so several can fly at once without interfering.
 */
const FlyClone: FC<{ flight: Flight }> = ({ flight }) => {
  const clear = useCardFly((s) => s.clear);
  const { id, from, html, ring, radius, landed } = flight;

  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const scale = useSpring(1.03, SPRING);
  const [flying, setFlying] = useState(false); // drives zIndex only (one render)

  useEffect(() => {
    if (!landed) return;
    let raf = 0;
    let started = false; // has the first post-render read happened yet?
    const chase = () => {
      const el = cardEl(id);
      if (!el) return clear(id);
      const r = rectOf(el);
      const dx = r.left - from.left;
      const dy = r.top - from.top;
      if (!started) {
        started = true;
        // no real move (e.g. status unchanged) → nothing to animate
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return clear(id);
        setFlying(true); // lift above everything and settle the takeoff pop
        scale.set(1);
      }
      // re-aim the springs at the card's current position (velocity-preserving,
      // so a mid-flight scroll retargets smoothly instead of snapping)
      x.set(dx);
      y.set(dy);
      // at target and slow → landed
      if (
        Math.abs(x.get() - dx) < 0.5 &&
        Math.abs(y.get() - dy) < 0.5 &&
        Math.abs(x.getVelocity()) < 5 &&
        Math.abs(y.getVelocity()) < 5
      ) {
        return clear(id);
      }
      raf = requestAnimationFrame(chase);
    };
    // double rAF: wait for the cache patch to re-render the card at its new slot
    // before the first read, then chase it.
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(chase);
    });
    return () => cancelAnimationFrame(raf);
  }, [landed, id, from, clear, x, y, scale]);

  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none fixed shadow-lg transition-shadow",
        ring && RING_CLASS[ring],
      )}
      style={{
        // In flight it rides above everything; lifted in place it sits at
        // content level, below an open modal.
        zIndex: flying ? Z.flyover : Z.header,
        top: from.top,
        left: from.left,
        width: from.width,
        height: from.height,
        borderRadius: radius,
        x,
        y,
        scale,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Renders the flying clones for in-flight card moves (see useCardFly). Mounted
 * once on the tasks page; portals to <body> so the clones sit above the lanes
 * and aren't clipped by their overflow. One <FlyClone> per active flight, keyed
 * so a repeat flight of the same card starts a fresh clone.
 */
const CardFlyOverlay = () => {
  const flights = useCardFly((s) => s.flights);
  const active = Object.values(flights);

  if (active.length === 0) return null;

  return createPortal(
    <>
      {active.map((flight) => (
        <FlyClone key={flight.key} flight={flight} />
      ))}
    </>,
    document.body,
  );
};

export default CardFlyOverlay;
