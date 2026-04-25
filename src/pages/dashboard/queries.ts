import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { fetchUserEvents, fetchPendingInvites, acceptInvite, rejectInvite } from "./api"
import type { EventsCount } from "./types"
import { getEventStatus } from "@/lib/utils/utils-time"

export const eventsQueryKey = ["events"] as const
export const pendingInvitesQueryKey = ["invites", "pending"] as const

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

export function usePendingInvitesQuery(enabled = true) {
  return useQuery({
    queryKey: pendingInvitesQueryKey,
    queryFn: fetchPendingInvites,
    enabled,
  })
}

export function useAcceptInviteMutation() {
  const qc = useQueryClient()
  return useMutation<string, void>(acceptInvite, {
    successMessage: "Invite accepted! Welcome to the team.",
    errorMessage: "Failed to accept invite",
    onSuccess: () => {
      // Refresh both: invite disappears, event appears in the grid
      qc.invalidateQueries({ queryKey: pendingInvitesQueryKey })
      qc.invalidateQueries({ queryKey: eventsQueryKey })
    },
  })
}

export function useRejectInviteMutation() {
  const qc = useQueryClient()
  return useMutation<string, void>(rejectInvite, {
    successMessage: "Invite declined",
    errorMessage: "Failed to decline invite",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pendingInvitesQueryKey })
    },
  })
}