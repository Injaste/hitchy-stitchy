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
    <>
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Logo
            imageClassName="w-24 h-24 -mb-6"
            className="mb-4"
            showBrand
            showTagline
            brandClassName="text-2xl font-bold text-primary"
          />
        </div>

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
    </>
  );
};

export default CreateEventView;
