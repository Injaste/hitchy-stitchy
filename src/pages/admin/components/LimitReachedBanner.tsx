import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { itemRevealInUp } from "@/lib/animations";
import { usePlan } from "../hooks/usePlan";
import { useUpgradeModalStore } from "../plan/hooks/useUpgradeModalStore";

/** Sits above the ActiveCueBanner: a compact trigger that appears only when a
 *  plan limit is reached, opening the upgrade modal (which owns the per-feature
 *  detail + pay surface). Limits only — activation (pay-to-activate) is a
 *  separate concern. Mirrors the cue banner's reveal animation + layout. */
const LimitReachedBanner: FC = () => {
  const { reachedLimits } = usePlan();
  const open = useUpgradeModalStore((s) => s.open);

  return (
    <AnimatePresence>
      {reachedLimits.length > 0 && (
        <motion.button
          key="limit-banner"
          type="button"
          onClick={open}
          {...itemRevealInUp}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-1 text-left text-sm transition-colors hover:bg-warning/20"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          </span>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 font-medium text-warning">
              Limit reached
            </span>
            <span className="ml-auto shrink-0 text-xs font-medium text-muted-foreground">
              Upgrade for more
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default LimitReachedBanner;
