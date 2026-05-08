import type { FC, ReactNode } from "react";
import { motion } from "framer-motion";

interface TabSlideProps {
  direction: number;
  children: ReactNode;
  className?: string;
}

const SLIDE_DISTANCE = 25;

const ComponentSlide: FC<TabSlideProps> = ({ direction, children, className }) => {
  const enterX = direction === 0 ? 0 : direction * SLIDE_DISTANCE;
  const exitX = direction === 0 ? 0 : -direction * SLIDE_DISTANCE;

  return (
    <motion.div
      className={className}
      initial={{ filter: "blur(4px)", opacity: 0, x: enterX }}
      animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
      exit={{ filter: "blur(4px)", opacity: 0, x: exitX }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

export default ComponentSlide;
