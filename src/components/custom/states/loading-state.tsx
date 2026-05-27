import { motion } from "framer-motion";
import Logo from "@/components/custom/logo";

const LoadingState = () => (
  <motion.div
    key="loading-state"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="min-h-screen flex flex-col justify-center items-center gap-10"
  >
    <Logo
      imageClassName="w-20 h-20"
      showBrand
      brandClassName="text-xl"
      showTagline
    />

    <div className="flex gap-2" aria-label="Loading" role="status">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-foreground/40"
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </motion.div>
);

export default LoadingState;
