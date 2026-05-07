import { itemFadeIn } from "@/lib/animations";
import { motion } from "framer-motion";
import { CalendarHeart } from "lucide-react";

const LoadingState = () => (
  <motion.div
    variants={itemFadeIn}
    initial="hidden"
    animate="show"
    className="min-h-screen bg-background flex items-center justify-center"
  >
    <CalendarHeart className="w-10 h-10 text-primary animate-pulse" />
  </motion.div>
);

export default LoadingState;
