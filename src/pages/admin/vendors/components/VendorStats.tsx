import type { FC } from "react";
import { motion } from "framer-motion";
import { Store } from "lucide-react";

import Odometer from "@/components/animations/animate-odometer";
import { itemRevealInUp } from "@/lib/animations";

interface VendorStatsProps {
  /** Everything on the roster. */
  total: number;
  /** How many survive the current search — equal to `total` when not filtering. */
  shown: number;
  isLoading: boolean;
  isError: boolean;
}

// The count, sat beside the search that changes it. Reads "6 vendors" at rest
// and "1 of 6 vendors" while filtering — the plain total would otherwise
// contradict the grid right below it. Borrows MemberStats' row (icon, odometer,
// label); vendors have no lifecycle, so the count is the whole stat.
const VendorStats: FC<VendorStatsProps> = ({
  total,
  shown,
  isLoading,
  isError,
}) => {
  if (isLoading || isError || !total) return null;

  const filtering = shown !== total;

  return (
    <motion.div
      layout
      {...itemRevealInUp}
      className="flex shrink-0 items-center gap-1.5 overflow-hidden text-sm text-muted-foreground"
    >
      <Store className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium text-foreground">
        <Odometer value={filtering ? shown : total} />
      </span>
      {filtering && <span>of {total}</span>}
      {/* Plural follows the total, not the shown count — "1 of 6 vendors" reads
          right, "1 of 6 vendor" doesn't. */}
      <span>{total === 1 ? "vendor" : "vendors"}</span>
    </motion.div>
  );
};

export default VendorStats;
