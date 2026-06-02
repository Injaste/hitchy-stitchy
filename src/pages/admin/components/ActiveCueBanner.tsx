import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { Play } from "lucide-react";

import { itemRevealInUp } from "@/lib/animations";
import { formatTime } from "@/lib/utils/utils-time";
import { useActiveTimelineQuery } from "../timeline/queries";
import { useTimelineModalStore } from "../timeline/hooks/useTimelineModalStore";
import { startDelayMinutes } from "../timeline/utils";

export function ActiveCueBanner() {
  const { data: active } = useActiveTimelineQuery();
  const openDetail = useTimelineModalStore((s) => s.openDetail);

  return (
    <AnimatePresence>
      {active && (
        <motion.button
          key="cue-banner"
          {...itemRevealInUp}
          type="button"
          onClick={() => openDetail(active)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/15 transition-colors"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
            <Play className="h-3 w-3 text-primary fill-primary" />
          </span>
          <span className="font-medium text-primary">Live Now:</span>
          <span className="text-foreground truncate">{active.title}</span>
          <span className="text-muted-foreground ml-auto text-xs shrink-0 flex items-center gap-1.5">
            <span>scheduled {formatTime(active.time_start)}</span>
            {active.started_at && (
              <>
                <span aria-hidden>·</span>
                <span>started {format(new Date(active.started_at), "h:mm a")}</span>
                {(() => {
                  const delay = startDelayMinutes(active);
                  return delay && delay > 0 ? (
                    <span className="text-destructive font-medium">(+{delay}m)</span>
                  ) : null;
                })()}
              </>
            )}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
