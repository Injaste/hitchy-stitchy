import { motion } from "framer-motion";
import { X, ArrowBigLeft } from "lucide-react";

import Logo from "@/components/custom/logo";
import { Button } from "@/components/ui/button";
import { container, itemFadeIn, itemFadeUp } from "@/lib/animations";

import CreateEventForm from "./CreateEventForm";

interface CreateEventViewProps {
  onClose: () => void;
}

const CreateEventView = ({ onClose }: CreateEventViewProps) => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative min-h-screen bg-background flex items-center justify-center px-4 py-12"
    >
      <motion.div variants={itemFadeIn} className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </motion.div>

      <div className="w-full max-w-md">
        <motion.div
          initial="hidden"
          animate="show"
          variants={itemFadeIn}
          className="text-center mb-10"
        >
          <Logo
            imageClassName="w-24 h-24 -mb-6"
            className="mb-4"
            showBrand
            showTagline
            brandClassName="text-2xl font-bold text-primary"
          />
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={itemFadeUp}>
          <CreateEventForm />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={itemFadeUp}
          className="text-center mt-6"
        >
          <Button variant="ghost" className="gap-2 text-xs" onClick={onClose}>
            <ArrowBigLeft className="size-4" />
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateEventView;
