import { motion } from "framer-motion";
import Logo from "@/components/custom/logo";

const LoadingState = () => (
  <motion.div
    key="loading-state"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen flex justify-center items-center"
  >
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <Logo
        imageClassName="w-24 h-24"
        showBrand
        brandClassName="text-xl"
        showTagline
      />
    </motion.div>
  </motion.div>
);

export default LoadingState;
