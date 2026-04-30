import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useAdminStore } from "../../store/useAdminStore";
import { useMembersQuery } from "../../members/queries";
import { useMarkArrivedMutation } from "../queries";

export function AttendancePanel() {
  const { memberId, isAdmin } = useAdminStore();
  const { data: members } = useMembersQuery();
  const { mutate: markArrived } = useMarkArrivedMutation();

  const activeMembers = (members ?? []).filter((m) => !m.is_frozen);
  // const arrivedCount = activeMembers.filter((m) => m.arrived_at).length;

  const canMark = (memberIdToMark: string) =>
    isAdmin || memberIdToMark === memberId;

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
              {m.role?.short_name?.slice(0, 2) ?? "–"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">
                {m.display_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {m.role?.name ?? "No role"}
              </p>
            </div>
            {/* {m.arrived_at ? ( */}
            <Badge variant="secondary" className="text-xs gap-1">
              <Check className="h-3 w-3" /> Arrived
            </Badge>
            {/* ) : canMark(m.id) ? (
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => markArrived(m.id)}>
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
