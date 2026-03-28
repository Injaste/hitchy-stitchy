import { CalendarDays, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/pages/admin/animations";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";
import { TimelineEventCard } from "./TimelineEventCard";
import type { TimelineEvent } from "./types";

interface Props {
  events: TimelineEvent[];
  day: "day1" | "day2";
}

function groupEventsByTime(events: TimelineEvent[]) {
  const grouped: { time: string; events: TimelineEvent[] }[] = [];
  const sorted = [...events].sort((a, b) => {
    const tA = new Date(`1970/01/01 ${a.time}`).getTime();
    const tB = new Date(`1970/01/01 ${b.time}`).getTime();
    return tA - tB;
  });
  sorted.forEach((event) => {
    const last = grouped[grouped.length - 1];
    if (last && last.time === event.time) {
      last.events.push(event);
    } else {
      grouped.push({ time: event.time, events: [event] });
    }
  });
  return grouped;
}

export function TimelineList({ events, day }: Props) {
  const grouped = groupEventsByTime(events);
  const { teamRoles, currentRole } = useAdminStore();
  const { openEventModal } = useModalStore();
  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  if (events.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeIn(0)}
        className="flex flex-col items-center justify-center py-20 gap-3 text-center"
      >
        <CalendarDays className="h-10 w-10 text-muted-foreground opacity-30" />
        <p className="font-semibold text-foreground">No events yet</p>
        {isAdmin && (
          <p className="text-sm text-muted-foreground">
            Tap + to add the first event for this day.
          </p>
        )}
        {isAdmin && (
          <button
            onClick={() => openEventModal(day)}
            className="mt-2 text-sm text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Add event
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="relative border-l-2 border-primary/30 ml-3 md:ml-6 space-y-6 md:space-y-8 pb-24">
      {grouped.map((group, groupIndex) => {
        const isMainGroup = group.events.some((e) => e.isMainEvent);
        return (
          <div key={group.time} className="relative">
            <div
              className={cn(
                "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 bg-card",
                isMainGroup ? "border-primary bg-primary/10" : "border-border"
              )}
            />
            <div className="flex items-center gap-2 text-primary font-semibold mb-3 pl-5 md:pl-8">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="text-sm md:text-base">{group.time}</span>
            </div>
            <div className="pl-5 md:pl-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {group.events.map((event, i) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  day={day}
                  index={groupIndex * 10 + i}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
