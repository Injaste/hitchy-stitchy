import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

export function EventLogPanel() {
  const { logs, currentRole, addLog } = useAdminStore();

  const quickActions = [
    {
      label: "Help Needed",
      msg: "Need Help!",
      className: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20",
      toastFn: () => toast.error(`${currentRole} needs help!`),
    },
    {
      label: "Task Done",
      msg: "Task Done",
      className: "bg-secondary/20 text-secondary-foreground border border-border hover:bg-secondary/30",
      toastFn: () => toast.success(`${currentRole} completed a task.`),
    },
    {
      label: "Running Late",
      msg: "Running Late!",
      className: "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100",
      toastFn: () => toast("Running late!", { icon: "⚠️" }),
    },
    {
      label: "Ready!",
      msg: "Ready for Next Cue",
      className: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20",
      toastFn: () => toast.success(`${currentRole} is ready!`),
    },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">Event Logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, msg, className, toastFn }) => (
            <button
              key={label}
              onClick={() => {
                addLog(currentRole, msg);
                toastFn();
              }}
              className={`py-2.5 rounded-lg font-medium text-sm active:scale-95 transition-all shadow-sm ${className}`}
            >
              {label}
            </button>
          ))}
        </div>

        <ScrollArea className="h-64 rounded-lg border border-border bg-muted/30">
          <div className="p-3 space-y-2">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="text-sm p-2.5 bg-card rounded-md border border-border shadow-sm">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-primary">{log.role}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-foreground">{log.msg}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
