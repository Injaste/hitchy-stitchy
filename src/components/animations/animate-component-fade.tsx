import type { FC } from "react";
import { motion, type Variants } from "framer-motion";

interface ComponentFadeProps {
  children: React.ReactNode;
  className?: string;
}

const pageTransition: Variants = {
  // `filter: blur(...)` was here but it creates a CSS stacking context
  // on its host element, which pins `position: fixed` descendants
  // (e.g. dnd-kit's DragOverlay) inside the host instead of the
  // viewport. Disabled while diagnosing the tasks board drag-and-drop.
  hidden: { opacity: 0 /* filter: "blur(2px)" */ },
  show: {
    opacity: 1,
    // filter: "blur(0px)",
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    // filter: "blur(2px)",
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const ComponentFade: FC<ComponentFadeProps> = ({ children, className }) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ComponentFade;
