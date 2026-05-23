import type { FC } from "react";
import { motion, type Variants } from "framer-motion";

interface ComponentFadeProps {
  children: React.ReactNode;
  className?: string;
  /** Skip the fade-in and start fully visible. Still fades out on exit. */
  initialVisible?: boolean;
}

const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(2px)",
  },
  show: {
    opacity: 1,
    filter: "",
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    filter: "blur(2px)",
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const ComponentFade: FC<ComponentFadeProps> = ({ children, className, initialVisible }) => {
  return (
    <motion.div
      initial={initialVisible ? "show" : "hidden"}
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
