import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useArrivalMutations } from "./queries";

export function BridesmaidsCheckin() {
  const { teamRoles, arrivals, currentRole } = useAdminStore();
  const { arrive } = useArrivalMutations();
  const bridesmaids = teamRoles.filter((r) => r.isBridesmaid);
  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">Bridesmaid Check-in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bridesmaids.map((b) => {
          const hasArrived = arrivals[b.role];
          return (
            <div
              key={b.role}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm"
            >
              <span
                className={cn(
                  "font-medium",
                  hasArrived ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {b.role} – {b.names.join(" & ")}
              </span>
              {hasArrived ? (
                <div className="flex items-center gap-1.5 text-secondary-foreground bg-secondary/20 px-3 py-1.5 rounded-full text-sm font-medium border border-border">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Arrived
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => arrive.mutate(b.role)}
                  disabled={currentRole !== b.role && !isAdmin}
                >
                  Mark Arrived
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
