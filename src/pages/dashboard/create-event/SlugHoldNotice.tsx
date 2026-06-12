import { useEffect, useState, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Stay silent until the hold has ≤ 10 min left — a heads-up only when it matters,
// no ticking countdown that pressures the user.
const WARN_WINDOW_MS = 10 * 60_000;

interface SlugHoldNoticeProps {
  /** ISO expiry of the current slug hold, or null when nothing is held. */
  expiry: string | null;
  onRefresh: () => void;
  refreshing?: boolean;
}

const SlugHoldNotice: FC<SlugHoldNoticeProps> = ({
  expiry,
  onRefresh,
  refreshing,
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiry) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [expiry]);

  const remaining = expiry ? new Date(expiry).getTime() - now : 0;
  const show = !!expiry && remaining > 0 && remaining <= WARN_WINDOW_MS;

  // Reveals via the same height + opacity animation as the inline form errors.
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: "hidden" }}
        >
          <div className="flex items-center justify-center gap-1.5 pb-4 text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 shrink-0 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-56 text-center">
                  We will hold your URL for 30 minutes while you set up —
                  refresh if you need more time.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>We're still holding your URL.</span>
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={refreshing}
              onClick={onRefresh}
              className="h-auto p-0 text-xs normal-case text-primary underline"
            >
              I need more time.
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlugHoldNotice;
