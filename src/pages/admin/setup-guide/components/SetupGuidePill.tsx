import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";

import { ProgressBorder } from "./ProgressBorder";

/** The collapsed guide — a small circular button whose border is the progress
 *  meter. Clicking it re-expands the panel. */
export default function SetupGuidePill({
  pct,
  doneCount,
  totalCount,
  onExpand,
}: {
  pct: number;
  doneCount: number;
  totalCount: number;
  onExpand: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onExpand}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      style={{ transformOrigin: "bottom right" }}
      aria-label={`Get started — ${doneCount} of ${totalCount} done`}
      className="relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-popover text-popover-foreground shadow-lg transition-transform active:scale-95"
    >
      <ProgressBorder pct={pct} />
      <ListChecks className="size-4 text-primary" />
    </motion.button>
  );
}
