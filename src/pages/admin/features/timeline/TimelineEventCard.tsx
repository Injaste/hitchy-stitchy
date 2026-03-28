import { motion } from "framer-motion";
import { Bell, StickyNote, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/pages/admin/animations";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import type { TimelineEvent } from "./types";

interface Props {
  event: TimelineEvent;
  day: "day1" | "day2";
  index: number;
}

export function TimelineEventCard({ event, day, index }: Props) {
  const { teamRoles, currentRole } = useAdminStore();
  const { openEventModal, openConfirmStart, openPingModal } = useModalStore();

  const canStart = currentRole === "Coordinator" || currentRole === "Floor manager";

  const getAssigneeDisplay = (roleName: string) => {
    if (roleName === "All") return "All";
    const role = teamRoles.find((r) => r.role === roleName);
    if (role) return `${role.shortRole} – ${role.names.join(" & ")}`;
    return roleName;
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp(index * 0.05)}
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Card
          onClick={() => openEventModal(day, event)}
          className={cn(
            "transition-all duration-300 hover:shadow-md relative group cursor-pointer overflow-hidden",
            event.startedAt
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : event.isMainEvent
              ? "border-primary/40 shadow-sm"
              : "border-border"
          )}
        >
          {event.startedAt && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
          )}

          <div className="absolute top-3 right-3 flex gap-2 items-center">
            {event.startedAt && (
              <div className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                <div className="w-1 h-1 bg-primary-foreground rounded-full" />
                LIVE
              </div>
            )}
            {!event.startedAt && canStart && (
              <Button
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmStart(event, day);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase"
              >
                Start
              </Button>
            )}
          </div>

          <CardHeader className="pb-3 pt-4 px-4 md:px-6">
            <div className="flex flex-col gap-2 pr-24">
              <CardTitle className="text-base leading-tight">{event.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                <Users className="h-3 w-3 text-muted-foreground" />
                {event.assignees.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPingModal(role);
                    }}
                    className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border hover:bg-muted/80 transition-colors"
                  >
                    {getAssigneeDisplay(role)}
                    <Bell className="w-3 h-3" />
                  </button>
                ))}
              </div>
              {event.startedAt && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit border border-primary/20">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Started at {event.startedAt}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-4">
            <CardDescription className="text-sm">{event.description}</CardDescription>
            {event.notes && (
              <div className="mt-3 text-xs bg-primary/5 p-2.5 rounded-md text-primary border border-primary/10 flex gap-2 items-start">
                <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <span className="leading-relaxed">{event.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
