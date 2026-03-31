import { useQuery } from "@/lib/query/useQuery"
import { fetchUserEvents } from "./api"

export function useUserEventsQuery(enabled = true) {
  return useQuery(fetchUserEvents, { key: "user-events", enabled })
}
