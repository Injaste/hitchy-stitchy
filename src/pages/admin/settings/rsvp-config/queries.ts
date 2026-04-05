import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../../store/useAdminStore'
import { adminKeys } from '../../lib/queryKeys'
import { fetchRSVPConfig, updateRSVPConfig } from './api'
import type { RSVPConfig } from './types'

export function useRSVPConfigQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.settingsRsvpConfig(slug),
    queryFn: () => fetchRSVPConfig(eventId),
    enabled: !!eventId,
  })
}

export function useUpdateRSVPConfigMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<{ eventId: string; config: RSVPConfig }, RSVPConfig>(updateRSVPConfig, {
    successMessage: 'RSVP config saved',
    errorMessage: 'Failed to save RSVP config',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.settingsRsvpConfig(slug) }) },
  })
}
