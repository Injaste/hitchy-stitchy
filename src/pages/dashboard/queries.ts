import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { fetchUserEvents, claimInvite } from "./api"
import type { EventsCount } from "./types"
import { getEventStatus } from "@/lib/utils/utils-time"

export const eventsQueryKey = ["events"] as const
export const pendingInvitesQueryKey = ["events", "invites"] as const

export function useEventsQuery(enabled = true) {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: fetchUserEvents,
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
  return useMutation<{ eventId: string; action: "accept" | "reject" }, void>(claimInvite, {
    successMessage: (_result, args) => args.action === "accept" ? "Invite accepted!" : "Invite declined",
    errorMessage: "Failed to update invite",
    onSuccess: () => qc.invalidateQueries({ queryKey: eventsQueryKey }),
  })
}