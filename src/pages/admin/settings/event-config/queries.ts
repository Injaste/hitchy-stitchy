import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../../store/useAdminStore'
import { adminKeys } from '../../lib/queryKeys'
import { fetchEventConfig, updateEventConfig } from './api'
import type { EventConfig } from './types'

export function useEventConfigQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.settingsEvent(slug),
    queryFn: () => fetchEventConfig(eventId),
    enabled: !!eventId,
  })
}

export function useUpdateEventConfigMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<{ eventId: string; config: EventConfig }, EventConfig>(updateEventConfig, {
    successMessage: 'Event settings saved',
    errorMessage: 'Failed to save settings',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.settingsEvent(slug) }) },
  })
}
