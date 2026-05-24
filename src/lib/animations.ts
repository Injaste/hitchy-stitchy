import type { Variants } from "framer-motion";

export const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.10,
    },
  },
};

export const itemScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 }
  },
};

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  },
};

export const itemFadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

export const widthReveal: Variants = {
  hidden: {
    width: 0,
    opacity: 0,
    marginLeft: -8,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
  show: {
    width: "auto",
    opacity: 1,
    marginLeft: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export const TASK_ITEM_DURATION = 0.2; // seconds — used by TaskQuickAdd scroll-into-view timing

// ── Tasks kanban ────────────────────────────────────────────────────────
// Used by TasksSection + its cards. Section fades in with an optional
// delay (for cross-section staggering). Cards fade in below the section,
// staggered on first mount only — subsequent reorders/adds use baseDelay
// = 0 and stagger = 0 so movement feels instant.

export const taskSectionEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut", delay },
  }),
};

export type TaskCardEnterCustom = {
  baseDelay: number;
  stagger: number;
  index: number;
};

export const taskCardEnter: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: (c: TaskCardEnterCustom) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, delay: c.baseDelay + c.index * c.stagger },
  }),
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export const taskCardLayoutTransition = {
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

//!TO DEPRECATE - PLEASE USE THE ABOVE

export const fadeUp = (delay: number, y = 24, duration = 0.8): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay },
  },
});

export const fadeIn = (delay: number, duration = 0.8): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" },
  },
});

export const scaleIn = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay },
  },
});

export const tabTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
};
