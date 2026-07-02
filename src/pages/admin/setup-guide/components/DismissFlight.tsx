import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";

import { Z } from "@/lib/z-index";

export type Point = { x: number; y: number };

const F = 18; // half the flying icon's size, to center it on the coordinates

/** A small guide icon that flies from the dismissed panel to the Event Settings
 *  button (the guide's home), so the couple sees where to reopen it. Purely
 *  visual — `onComplete` fires when it lands. */
export default function DismissFlight({
  from,
  to,
  onComplete,
}: {
  from: Point;
  to: Point;
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ x: from.x - F, y: from.y - F, scale: 1, opacity: 1 }}
      animate={{ x: to.x - F, y: to.y - F, scale: 0.45, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={onComplete}
      style={{ zIndex: Z.flyover }}
      className="pointer-events-none fixed left-0 top-0 flex size-9 items-center justify-center rounded-full bg-popover shadow-lg ring-1 ring-primary/30"
    >
      <ListChecks className="size-4 text-primary" />
    </motion.div>
  );
}
