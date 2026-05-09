import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { RSVPFormClassNames, RSVPFormLabels } from "../types";

interface SubmitButtonProps {
  isEditing: boolean;
  classNames: RSVPFormClassNames;
  labels: RSVPFormLabels;
  isSubmitting: boolean;
  canSubmit: boolean;
}

const SubmitButton = ({
  isEditing,
  classNames,
  labels,
  isSubmitting,
  canSubmit,
}: SubmitButtonProps) => {
  const text = isSubmitting
    ? labels.submit.submitting
    : isEditing
      ? labels.submit.editing
      : labels.submit.idle;

  return (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn("w-full", classNames.submit)}
      disabled={isSubmitting || !canSubmit}
    >
      {text}
    </motion.button>
  );
};

export default SubmitButton;
