import type { Variants } from "framer-motion";

// Create-event stepper chain. Advancing reads as one flowing motion:
//   (1) the completed step's tick pops in →
//   (2) the connector dash strokes across →
//   (3) the next step's circle + label fill.
// Going back plays the beats in reverse (leaving step dims → dash recedes → the
// step we land on un-ticks and re-lights). No direction flag needed: a tick only
// ever enters on advance and exits on back (the number is the mirror), so the
// per-beat delays live in the variants and reverse for free.

// Beat 3 — the arriving node's *colour* fills only after the dash has crossed
// (dash = 0.18 delay + 0.22 dur), via a CSS transition-delay on the step node.
// The tick/number swap itself is NOT delayed: it lives in an AnimatePresence
// popLayout, which absolutely-positions the exiting child — delaying that exit
// pops the tick out of the circle's centring (a visible, displaced tick).
export const STEPPER_NODE_FILL_DELAY = "0.4s";

// Tick: pops in/out promptly (no delay) so popLayout never leaves it displaced.
export const stepperCheckIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
};

export const stepperNumberIn: Variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.15 } },
  exit: { scale: 0.6, opacity: 0, transition: { duration: 0.15 } },
};

// Beat 2 — the connector dash. scaleX from origin-left (advance L→R, back R→L),
// delayed so it strokes across after the tick, before the arriving node fills.
export const stepperConnectorFill = {
  duration: 0.22,
  ease: "easeInOut",
  delay: 0.18,
} as const;
