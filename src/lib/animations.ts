import type { Variants } from "framer-motion";

export const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // The magic number you requested
    },
  },
};

export const itemScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7 }
  },
};

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  },
};

export const itemFadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

export const cardHover = { y: -3, transition: { duration: 0.2 } };

export const itemShake = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4 },
  },
};

export const itemRevealIn = {
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
