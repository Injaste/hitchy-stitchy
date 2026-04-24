import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { RSVPFormClassNames, RSVPFormLabels } from "../types";

interface CancelButtonProps {
  onCancel: () => void;
  classNames: RSVPFormClassNames;
  labels: RSVPFormLabels;
}

const CancelButton = ({ onCancel, classNames, labels }: CancelButtonProps) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onCancel}
      className={cn(classNames.cancel)}
    >
      {labels.cancel}
    </motion.button>
  );
};

export default CancelButton;
