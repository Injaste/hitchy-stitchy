import { Radio } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";

const PAGE_LABELS: Record<string, string> = {
  day1: "Timeline — Day 1",
  day2: "Timeline — Day 2",
  checklist: "Tasks",
  team: "Team",
  live: "Live Operations",
  rsvps: "RSVPs",
  users: "Users",
  settings: "Settings",
};

export function AdminTopbar() {
  const { activePage, setActivePage } = useAdminStore();
  const { activeCueEvent } = useCueStore();
  const label = PAGE_LABELS[activePage] ?? "Dashboard";
  const hasCue = !!activeCueEvent;

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4 shrink-0">
      {/* Left: mobile trigger + page label */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="md:hidden shrink-0" />
        <p className="text-sm font-medium text-foreground/80 font-serif truncate">{label}</p>
      </div>

      {/* Right: Live button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("live")}
        className={cn(
          "shrink-0 gap-2 text-xs",
          hasCue
            ? "bg-destructive/10 text-destructive border border-destructive/30 rounded-full hover:bg-destructive/15"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {hasCue ? (
          <>
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <span className="max-w-[120px] truncate">{activeCueEvent!.title}</span>
          </>
        ) : (
          <>
            <Radio className="h-3.5 w-3.5" />
            <span>Live</span>
          </>
        )}
      </Button>
    </header>
  );
}
