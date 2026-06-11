import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { fetchUserEvents, createEvent } from "./api"
import type { Event, EventsCount, CreateEventPayload } from "./types"
import { getEventStatus } from "@/lib/utils/utils-time"

export const eventsQueryKey = ["events"] as const

const STATUS_ORDER = { active: 0, upcoming: 1, past: 2 } as const;

export function useEventsQuery(enabled = true) {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: fetchUserEvents,
    select: (events) =>
      [...events].sort((a, b) => {
        const sa = STATUS_ORDER[getEventStatus(a.date_start, a.date_end)];
        const sb = STATUS_ORDER[getEventStatus(b.date_start, b.date_end)];
        if (sa !== sb) return sa - sb;
        return a.date_start.localeCompare(b.date_start);
      }),
    enabled,
  })
}

export function useCountEventsQuery(enabled = true) {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: fetchUserEvents,
    select: (events) => {
      const active = events.filter(
        (e) => getEventStatus(e.date_start, e.date_end) === "active"
      ).length
      const upcoming = events.filter(
        (e) => getEventStatus(e.date_start, e.date_end) === "upcoming"
      ).length
      return { active, upcoming } as EventsCount
    },
    enabled,
  })
}

export function useCreateEventMutation() {
  const qc = useQueryClient()
  return useMutation(
    (payload: CreateEventPayload) => createEvent(payload),
    {
      silent: true,
      onSuccess: (result: Event) => {
        qc.setQueryData<Event[]>(eventsQueryKey, (old) => [
          ...(old ?? []),
          result,
        ])
      },
    },
  )
}
