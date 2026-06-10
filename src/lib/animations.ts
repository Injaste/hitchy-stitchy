import type { Variants } from "framer-motion";

export const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const itemScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: (i ?? 0) * 0.08 },
  }),
};

export const itemFadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

export const widthReveal: Variants = {
  hidden: {
    width: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
  show: {
    width: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export const TASK_ITEM_DURATION = 0.2; // seconds — used by TaskQuickAdd scroll-into-view timing

// Task-section fade-in: each kanban column fades up, with an optional delay so
// columns can stagger relative to one another. (Cards reorder via dnd-kit, not
// framer — see TasksSection.)
export const taskSectionEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut", delay },
  }),
};

// Animated list items that re-sort under the user — e.g. the budget sheet, whose
// rows reorder by urgency as items are added, paid off, or removed. Pair the
// variant (enter/exit height reveal) with layout="position" on the row: the
// layout slide handles reorder while the height tween owns grow/collapse, so the
// two don't fight over size. No per-row entrance on first paint — the list wraps
// these in <AnimatePresence initial={false}>, so only later add/remove/reorder
// animate (a table should just *be there* on load, not cascade in).
export const listItemReveal: Variants = {
  hidden: { opacity: 0, height: 0 },
  show: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};

export const listLayoutTransition = {
  duration: 0.22,
  ease: [0.2, 0, 0, 1],
} as const;

export const itemShake = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4 },
  },
};

export const itemRevealInUp = {
  initial: { opacity: 0, y: -4, height: 0 },
  animate: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -4, height: 0, transition: { duration: 0.15 } },
};

export const fieldVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

