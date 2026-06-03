import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { differenceInSeconds, format } from "date-fns";
import { Clock, ClockCheck, Play } from "lucide-react";

import { itemRevealInUp } from "@/lib/animations";
import type { Timeline } from "../timeline/types";

import { formatRemainingTime, formatTimeRange } from "@/lib/utils/utils-time";
import { useTimelineModalStore } from "../timeline/hooks/useTimelineModalStore";
import { scheduledEndDate, startDelayMinutes } from "../timeline/utils";
import ArraySeparator from "@/components/custom/array-separator";
import { useNow } from "@/hooks/use-now";

interface ActiveCueBannerProps {
  active?: Timeline | null;
}

const ActiveCueBanner: FC<ActiveCueBannerProps> = ({ active }) => {
  const now = useNow(1_000);
  const openDetail = useTimelineModalStore((s) => s.openDetail);

  return (
    <AnimatePresence>
      {active && (
        <motion.button
          key="cue-banner"
          {...itemRevealInUp}
          type="button"
          onClick={() => openDetail(active)}
          className="w-full flex items-center gap-3 px-2 py-2 text-sm cursor-pointer hover:bg-primary/15 transition-colors rounded-xl"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
            <Play className="h-3 w-3 text-primary fill-primary" />
          </span>
          <span className="font-medium text-primary">Live Now:</span>
          <span className="text-foreground truncate">{active.title}</span>
          <span className="text-muted-foreground ml-auto text-xs shrink-0 flex items-center gap-1.5">
            <span className="flex items-center gap-1.5 min-w-0">
              <Clock className="size-3 shrink-0" />
              <ArraySeparator
                items={formatTimeRange(active.time_start, active.time_end)}
                separator="-"
                className="gap-1"
              />
            </span>

            {active.started_at && (
              <>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-1.5 min-w-0">
                  <ClockCheck className="size-3 shrink-0" />
                  {format(new Date(active.started_at), "h:mm a")}
                </span>
                {(() => {
                  const delay = startDelayMinutes(active);
                  return delay && delay > 0 ? (
                    <span className="text-destructive font-medium">
                      (+{delay}m)
                    </span>
                  ) : null;
                })()}
                {(() => {
                  const end = scheduledEndDate(active);
                  if (!end) return null;
                  const remaining = differenceInSeconds(end, now);
                  if (remaining <= 0) return null;
                  return (
                    <span className="text-muted-foreground">
                      ({formatRemainingTime(remaining)} left)
                    </span>
                  );
                })()}
              </>
            )}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ActiveCueBanner;
