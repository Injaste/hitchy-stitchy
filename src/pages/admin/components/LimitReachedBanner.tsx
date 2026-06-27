import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Lock } from "lucide-react";

import { itemRevealInUp } from "@/lib/animations";
import { usePlan } from "../hooks/usePlan";
import { useUpgradeModalStore } from "../plan/hooks/useUpgradeModalStore";

/** Sits above the ActiveCueBanner: a compact trigger that opens the upgrade
 *  modal. Two flavours — "at a cap" (isReachedPlanLimits, growth blocked) and the
 *  stronger "over the plan" (isOverPlanLimits, a downgrade that locks editing).
 *  Limits only — activation is a separate concern. Mirrors the cue banner. */
const LimitReachedBanner: FC = () => {
  const { isReachedPlanLimits, isOverPlanLimits, canUpgrade } = usePlan();
  const open = useUpgradeModalStore((s) => s.open);

  return (
    <AnimatePresence>
      {(isOverPlanLimits || (isReachedPlanLimits && canUpgrade)) && (
        <motion.button
          key="limit-banner"
          type="button"
          onClick={open}
          {...itemRevealInUp}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-1 text-left text-sm transition-colors hover:bg-warning/10"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20">
            {isOverPlanLimits ? (
              <Lock className="h-3.5 w-3.5 text-warning" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            )}
          </span>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 font-medium text-warning">
              {isOverPlanLimits ? "Editing paused" : "Limit reached"}
            </span>
            <span className="ml-auto shrink-0 text-xs font-medium text-muted-foreground">
              {canUpgrade
                ? isOverPlanLimits
                  ? "Upgrade to unlock"
                  : "Upgrade for more"
                : "View options"}
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default LimitReachedBanner;
