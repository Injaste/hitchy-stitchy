import { format } from "date-fns";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAdminStore } from "../../store/useAdminStore";
import { useAccess } from "../../hooks/useAccess";
import { formatTime } from "@/lib/utils/utils-time";
import {
  useActiveTimelineQuery,
  useTimelineLifecycleMutations,
} from "../../timeline/queries";
import { startDelayMinutes } from "../../timeline/utils";

export function CueTracker() {
  const { eventId } = useAdminStore();
  const { canUpdate } = useAccess();
  const { data: active } = useActiveTimelineQuery();
  const { end } = useTimelineLifecycleMutations();

  if (!active) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No active cue</p>
      </div>
    );
  }

  const delay = startDelayMinutes(active);

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
          <Play className="h-4 w-4 text-primary fill-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {active.title}
          </p>
          <p className="text-xs text-muted-foreground">
            scheduled {formatTime(active.time_start)}
            {active.started_at && (
              <>
                {" · started "}
                {format(new Date(active.started_at), "h:mm a")}
                {delay && delay > 0 && (
                  <span className="text-destructive font-medium">
                    {" "}
                    (+{delay}m)
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {canUpdate("timeline") && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-xs"
            onClick={() => end.mutate({ event_id: eventId!, id: active.id })}
            disabled={end.isPending}
          >
            <Square className="h-3.5 w-3.5" />
            End
          </Button>
        </div>
      )}
    </div>
  );
}
