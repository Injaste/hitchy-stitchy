import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TimelineCardView from "../../timeline/components/TimelineCardView";
import type { Timeline } from "../../timeline/types";
import type { CardLifecycle } from "../../timeline/utils";
import { useLiveRunDemoStore } from "../hooks/useLiveRunDemoStore";

// A fixed, illustrative cue — never persisted. It only exists to demo the live
// start/end controls; the buttons drive local state, no mutation runs.
const DEMO_ITEM: Timeline = {
  id: "demo",
  event_id: "demo",
  day: "2026-08-01",
  segment_id: "demo",
  label: null,
  time_start: "16:00",
  time_end: "16:30",
  title: "Couple walk in",
  details: null,
  assignees: [],
  created_at: "2026-06-01T00:00:00Z",
  started_at: null,
  ended_at: null,
};

const HINT: Record<Exclude<CardLifecycle, null>, string> = {
  start: "Press play to start the cue.",
  end: "It's live — press stop to end it.",
  done: "Ended. That's running the day live.",
};

/** The guide's safe live-run practice. Reuses the real timeline card, but its
 *  start/end controls only flip local lifecycle state — nothing is saved and no
 *  real cue is started. Opening it completes the "liverun" step. */
export default function LiveRunDemoModal() {
  const isOpen = useLiveRunDemoStore((s) => s.isOpen);
  const close = useLiveRunDemoStore((s) => s.close);
  const [lifecycle, setLifecycle] = useState<CardLifecycle>("start");

  // Reset to the start state each time it's opened, so it's always ready to try.
  useEffect(() => {
    if (isOpen) setLifecycle("start");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run your day live</DialogTitle>
          <DialogDescription>
            On the day, start and end each cue in real time so your whole team
            stays on the same moment. Try it here — nothing is saved.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4">
          <div className="mx-auto h-40 w-64">
            <TimelineCardView
              item={DEMO_ITEM}
              lifecycle={lifecycle}
              onStart={() => setLifecycle("end")}
              onEnd={() => setLifecycle("done")}
            />
          </div>

          <div className="flex min-h-6 items-center justify-center gap-2 pt-3">
            {lifecycle === "done" ? (
              <button
                type="button"
                onClick={() => setLifecycle("start")}
                className="flex cursor-pointer items-center gap-1 text-2xs font-medium text-primary hover:underline"
              >
                <RotateCcw className="size-3" />
                Try again
              </button>
            ) : (
              <p className="text-2xs text-muted-foreground">
                {lifecycle && HINT[lifecycle]}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
