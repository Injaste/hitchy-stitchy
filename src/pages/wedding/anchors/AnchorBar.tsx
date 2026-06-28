import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AnchorItem from "./AnchorItem";
import type { AnchorClassNames, AnchorItemConfig, AnchorLabels } from "./types";

interface AnchorBarProps {
  items: AnchorItemConfig[];
  classNames: AnchorClassNames;
  labels: AnchorLabels;
  onAction?: (name: string) => void;
  visible: boolean;
}

const AnchorBar = ({
  items,
  classNames,
  labels,
  onAction,
  visible,
}: AnchorBarProps) => {
  if (!items.length) return null;

  return (
    <motion.nav
      id="itinerary"
      aria-label={labels.ariaLabel ?? "Page navigation"}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex items-stretch justify-around",
        "border-t border-primary/15 bg-card/85 backdrop-blur-md",
        "px-2 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]",
        classNames.bar,
      )}
    >
      {items.map((item) => (
        <AnchorItem
          key={item.id}
          item={item}
          classNames={classNames}
          onAction={onAction}
        />
      ))}
    </motion.nav>
  );
};

export default AnchorBar;
