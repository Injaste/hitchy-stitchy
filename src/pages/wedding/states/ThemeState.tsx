import { motion, usePresence } from "framer-motion";

const FRAME_DURATION = 1.6;

// usePresence is used instead of the exit prop so the fade-out works reliably
// inside the admin preview iframe (react-frame-component uses a React portal,
// and Framer Motion's PresenceContext can break at portal boundaries).
const ThemeState = ({ children }: { children: React.ReactNode }) => {
  const [isPresent, safeToRemove] = usePresence();

  return (
    <motion.div
      animate={{ opacity: isPresent ? 1 : 0 }}
      transition={{ duration: isPresent ? 0 : 0.5, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (!isPresent) safeToRemove?.();
      }}
      className="fixed inset-0 w-screen h-dvh z-200 flex items-center justify-center bg-background overflow-hidden"
    >
      {/* FRAME */}
      <motion.div
        initial={{ opacity: 0, scale: 0.15 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: FRAME_DURATION,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute inset-6 border-[0.5px] border-accent/20 pointer-events-none z-20 flex items-center justify-center"
      >
        <div className="absolute -top-1 -left-1 w-12 h-12 border-t border-l border-accent/40" />
        <div className="absolute -top-1 -right-1 w-12 h-12 border-t border-r border-accent/40" />
        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b border-l border-accent/40" />
        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b border-r border-accent/40" />
      </motion.div>

      {children}
    </motion.div>
  );
};

export default ThemeState;
