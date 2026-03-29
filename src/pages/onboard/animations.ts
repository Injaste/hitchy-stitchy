import type { Variants } from "framer-motion";

// Shared animation factories — canonical source is @/lib/animations
export { fadeUp, fadeIn } from "@/lib/animations";

export const stepEnter: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

export const stepExit: Variants = {
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};
