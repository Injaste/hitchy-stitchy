import { motion } from "framer-motion";
import Logo from "@/components/custom/logo";

import { container, itemFadeIn, itemFadeUp } from "@/lib/animations";

import CreateEventForm from "./CreateEventForm";
import BackLink from "@/components/custom/back-link";

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
          <Logo imageClassName="w-16 h-16" className="mb-6" />
          <h1 className="text-2xl font-bold text-primary">Hitchy Stitchy</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Wedding Admin
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={itemFadeUp}>
          <CreateEventForm />
        </motion.div>

        <motion.div variants={itemFadeUp} className="text-center mt-8">
          <BackLink to="/dashboard" label="Back to Dashboard" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateEventView;
