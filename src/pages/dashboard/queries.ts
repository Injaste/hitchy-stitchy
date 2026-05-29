import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { fetchUserEvents, claimInvite, createEvent } from "./api"
import type { Event, EventsCount, ClaimInvitePayload, CreateEventPayload } from "./types"
import { getEventStatus } from "@/lib/utils/utils-time"

export const eventsQueryKey = ["events"] as const
export const pendingInvitesQueryKey = ["events", "invites"] as const

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
        (e) => getEventStatus(e.date_start, e.date_end) === "active" && !e.is_pending
      ).length
      const upcoming = events.filter(
        (e) => getEventStatus(e.date_start, e.date_end) === "upcoming" && !e.is_pending
      ).length
      const pending = events.filter(
        (e) => e.is_pending
      ).length
      return { active, upcoming, pending } as EventsCount
    },
    enabled,
  })
}

export function useClaimInviteMutation() {
  const qc = useQueryClient()
  return useMutation(
    (payload: ClaimInvitePayload) => claimInvite(payload),
    {
      successMessage: (_: void, args: ClaimInvitePayload) =>
        args.action === "accept"
          ? `Joined "${args.event_name}"`
          : `Declined invite to "${args.event_name}"`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: ClaimInvitePayload) => {
        qc.setQueryData<Event[]>(eventsQueryKey, (old) => {
          if (!old) return old
          if (args.action === "reject") return old.filter((e) => e.id !== args.event_id)
          return old.map((e) => e.id === args.event_id ? { ...e, is_pending: false } : e)
        })
      },
    },
  )
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
