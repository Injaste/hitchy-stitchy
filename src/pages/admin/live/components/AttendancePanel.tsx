import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useMembersQuery } from "../../members/queries";

export function AttendancePanel() {
  const { data: members } = useMembersQuery();

  const activeMembers = (members ?? []).filter((m) => !m.frozen_at);
  // const arrivedCount = activeMembers.filter((m) => m.arrived_at).length;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        {/* Attendance ({arrivedCount}/{activeMembers.length}) */}
        Attendance (0/{activeMembers.length})
      </h3>
      <div className="space-y-2">
        {activeMembers.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-lg border border-border p-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {m.display_name
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w: string) => w[0])
                .join("")
                .toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">
                {m.display_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {m.accessGroup?.name ?? "No access"}
              </p>
            </div>
            {/* {m.arrived_at ? ( */}
            <Badge variant="secondary" className="text-xs gap-1">
              <Check className="h-3 w-3" /> Arrived
            </Badge>
            {/* ) : canMark(m.id) ? (
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => markArrived({ member_id: m.id, display_name: m.display_name })}>
                <Clock className="h-3 w-3 mr-1" /> Mark
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">Pending</span>
            )} */}
          </div>
        ))}
      </div>
    </div>
  );
}
