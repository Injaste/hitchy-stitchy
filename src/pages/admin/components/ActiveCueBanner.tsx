import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { differenceInSeconds } from "date-fns";
import { Play } from "lucide-react";

import { itemRevealInUp } from "@/lib/animations";
import type { Timeline } from "../timeline/types";

import { formatRemainingTime } from "@/lib/utils/utils-time";
import { useTimelineModalStore } from "../timeline/hooks/useTimelineModalStore";
import { scheduledEndDate } from "../timeline/utils";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";
import PlanActualBar from "../timeline/components/PlanActualBar";

interface ActiveCueBannerProps {
  active?: Timeline | null;
}

const ActiveCueBanner: FC<ActiveCueBannerProps> = ({ active }) => {
  // Tick per-second only while something is live.
  const now = useNow(active ? 1_000 : null);
  const openDetail = useTimelineModalStore((s) => s.openDetail);

  // The one thing that matters live: how it's tracking — time remaining or how
  // far over. The plan-vs-actual bar (shared with the detail) carries the rest.
  const cue = (() => {
    if (!active?.started_at) return null;
    const start = new Date(active.started_at);
    const schedEnd = scheduledEndDate(active);
    if (!schedEnd) {
      const elapsed = differenceInSeconds(now, start);
      return { metric: `${formatRemainingTime(elapsed, 1)} elapsed`, over: false };
    }
    const remaining = differenceInSeconds(schedEnd, now);
    const over = remaining < 0;
    return {
      metric: over
        ? `${formatRemainingTime(-remaining, 1)} over`
        : `${formatRemainingTime(remaining, 1)} left`,
      over,
    };
  })();

  return (
    <AnimatePresence>
      {active && (
        <motion.button
          key="cue-banner"
          {...itemRevealInUp}
          type="button"
          onClick={() => openDetail(active)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm cursor-pointer transition-colors hover:bg-primary/15"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <Play className="h-3 w-3 fill-primary text-primary" />
          </span>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 font-medium text-primary">Live Now:</span>
              <span className="min-w-0 truncate text-foreground">
                {active.title}
              </span>
              {cue && (
                <span
                  className={cn(
                    "ml-auto shrink-0 text-xs font-medium tabular-nums",
                    cue.over ? "text-warning" : "text-muted-foreground",
                  )}
                >
                  {cue.metric}
                </span>
              )}
            </div>

            <PlanActualBar item={active} now={now} compact />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ActiveCueBanner;
