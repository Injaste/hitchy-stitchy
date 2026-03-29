import { useEffect } from "react";
import { toast } from "sonner";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useCueStore } from "@/pages/admin/store/useCueStore";

/** Polls every 10 s and fires a toast when a timeline event's time matches the current time. */
export function useScheduledNotifications() {
  const { events, teamRoles, currentRole } = useAdminStore();
  const { notifiedEvents, markNotified } = useCueStore();

  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    const interval = setInterval(() => {
      const timeString = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      for (const dayId of Object.keys(events)) {
        (events[dayId] ?? []).forEach((event) => {
          if (event.time === timeString && !notifiedEvents.has(event.id)) {
            if (isAdmin)
              toast.info(`Scheduled Event Now: ${event.title}`, {
                icon: "⏰",
                duration: 10000,
              });
            markNotified(event.id);
          }
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [events, isAdmin, notifiedEvents, markNotified]);
}
