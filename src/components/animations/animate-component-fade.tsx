import type { FC } from "react";
import { motion, type Variants } from "framer-motion";

interface ComponentFadeProps {
  children: React.ReactNode;
  className?: string;
  /** Skip the fade-in and start fully visible. Still fades out on exit. */
  initialVisible?: boolean;
}

// Opacity only. Unlike `filter`, opacity does not create a containing block, so
// this is safe to wrap around `position: fixed` elements (sidebar, topbar) — they
// fade with the page while still anchoring to the viewport.
const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: "easeIn" } },
};

const ComponentFade: FC<ComponentFadeProps> = ({ children, className, initialVisible }) => {
  return (
    <motion.div
      initial={initialVisible ? "show" : "hidden"}
      animate="show"
      exit="exit"
      variants={fade}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ComponentFade;
