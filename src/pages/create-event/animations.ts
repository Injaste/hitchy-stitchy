import type { Variants } from "framer-motion";

// Stepper — check icon pop-in (spring)
export const stepperCheckIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
      delay: 0.1,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
};

// Stepper — step number fade/scale
export const stepperNumberIn: Variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.15 } },
  exit: { scale: 0.6, opacity: 0, transition: { duration: 0.15 } },
};
