import { motion } from "framer-motion";

const FRAME_DURATION = 1.6;

const ThemeState = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 w-screen h-dvh z-50 flex items-center justify-center bg-primary-50 overflow-hidden">
      {/* 1. FRAME */}
      <motion.div
        initial={{ opacity: 0, scale: 0.2, inset: "50%" }}
        animate={{
          opacity: 1,
          scale: 1,
          inset: "1.5rem",
        }}
        transition={{
          duration: FRAME_DURATION,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute border-[0.5px] border-accent/20 pointer-events-none z-20 flex items-center justify-center"
      >
        <div className="absolute -top-1 -left-1 w-12 h-12 border-t border-l border-accent/40" />
        <div className="absolute -top-1 -right-1 w-12 h-12 border-t border-r border-accent/40" />
        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b border-l border-accent/40" />
        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b border-r border-accent/40" />
      </motion.div>
      {children}
    </div>
  );
};

export default ThemeState;
