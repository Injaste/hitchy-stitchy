import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../../store/useAdminStore'
import { adminKeys } from '../../lib/queryKeys'
import { fetchAppearance, updateAppearance } from './api'
import type { AppearanceConfig } from './types'

export function useAppearanceQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.settingsAppearance(slug),
    queryFn: () => fetchAppearance(eventId),
    enabled: !!eventId,
  })
}

export function useUpdateAppearanceMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<{ eventId: string; config: AppearanceConfig }, AppearanceConfig>(
    updateAppearance,
    {
      successMessage: 'Appearance saved',
      errorMessage: 'Failed to save appearance',
      onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.settingsAppearance(slug) }) },
    },
  )
}
