import { motion, type Variants } from "framer-motion";

interface ComponentFadeProps {
  children: React.ReactNode;
  className?: string;
}

const pageTransition: Variants = {
  hidden: { opacity: 0, filter: "blur(2px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    filter: "blur(2px)",
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

export function ComponentFade({ children, className }: ComponentFadeProps) {
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
}
