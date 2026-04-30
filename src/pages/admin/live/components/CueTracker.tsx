import { Play, SkipForward, ListOrdered } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useAdminStore } from "../../store/useAdminStore";
import { useCueStore } from "../../store/useCueStore";

export function CueTracker() {
  const { memberRoleCategory, isAdmin } = useAdminStore();
  const { activeCue } = useCueStore();

  if (!activeCue) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No active cue</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
          <Play className="h-4 w-4 text-primary fill-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {activeCue.title}
          </p>
          <p className="text-xs text-muted-foreground">{activeCue.timeStart}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-xs"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Advance Cue
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-xs"
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Override
          </Button>
        </div>
      )}
    </div>
  );
}
