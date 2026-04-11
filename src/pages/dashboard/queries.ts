import { useQuery } from "@tanstack/react-query";
import { fetchUserEvents } from "./api";
import type { EventsCount } from "./types";
import { getEventStatus } from "@/lib/utils/utils-time";

//TODO add userId in queryKey
export const eventsQueryKey = ["events"] as const;

export function useEventsQuery(enabled = true) {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: fetchUserEvents,
    enabled,
  });
}

export function useCountEventsQuery(enabled = true) {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: fetchUserEvents,
    select: (events) => {
      const activeCount = events.filter(e => getEventStatus(e.date_start, e.date_end) === "active").length;
      const upcomingCount = events.filter(e => getEventStatus(e.date_start, e.date_end) === "upcoming").length;

      const eventsCount: EventsCount = {
        active: activeCount,
        upcoming: upcomingCount
      }

      return eventsCount;
    },
    enabled,
  });
}