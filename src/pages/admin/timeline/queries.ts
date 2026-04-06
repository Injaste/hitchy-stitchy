import { useQuery } from '@tanstack/react-query'
import { useAdminStore } from '../store/useAdminStore'
import { adminKeys } from '../lib/queryKeys'

import { fetchTimelineEvents } from './api'

export function useTimelineQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.timeline(slug),
    queryFn: () => fetchTimelineEvents(eventId),
    enabled: !!eventId,
  })
}