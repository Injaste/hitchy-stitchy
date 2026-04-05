import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../store/useAdminStore'
import { adminKeys } from '../lib/queryKeys'
import { fetchRSVPs, updateRSVPStatus } from './api'
import type { RSVPEntry, RSVPStatus } from './types'

export function useRSVPQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.rsvps(slug),
    queryFn: () => fetchRSVPs(eventId),
    enabled: !!eventId,
  })
}

export function useUpdateRSVPStatusMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<{ id: string; status: RSVPStatus }, RSVPEntry>(updateRSVPStatus, {
    successMessage: 'RSVP status updated',
    errorMessage: 'Failed to update RSVP',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rsvps(slug) }) },
  })
}
