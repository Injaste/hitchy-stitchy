import { motion } from "framer-motion";
import { CalendarHeart } from "lucide-react";

import { container, itemFadeIn, itemFadeUp } from "@/lib/animations";

import CreateEventForm from "./CreateEventForm";
import { Link } from "react-router-dom";

const CreateEventView = () => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative min-h-screen bg-background flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial="hidden"
          animate="show"
          variants={itemFadeIn}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <CalendarHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary">
            Hitchy Stitchy
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Wedding Admin
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={itemFadeUp}>
          <CreateEventForm />
        </motion.div>

        <motion.div variants={itemFadeUp} className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            <Link
              to="/dashboard"
              className="hover:text-primary transition-colors"
            >
              ← Back to dashboard
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateEventView;
