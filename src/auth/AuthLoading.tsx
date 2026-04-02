import { motion } from "framer-motion";
import { CalendarHeart } from "lucide-react";

const AuthLoading = () => {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex justify-center items-center"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20"
      >
        <CalendarHeart className="w-8 h-8 text-primary" />
      </motion.div>
    </motion.div>
  );
};

export default AuthLoading;
