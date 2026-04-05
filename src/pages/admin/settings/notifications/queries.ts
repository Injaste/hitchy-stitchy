import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../../store/useAdminStore'
import { adminKeys } from '../../lib/queryKeys'
import { fetchNotificationPrefs, updateNotificationPrefs } from './api'
import type { NotificationPrefs } from './types'

export function useNotificationPrefsQuery() {
  const { slug, eventId, memberId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.settingsNotifications(slug, memberId),
    queryFn: () => fetchNotificationPrefs(eventId, memberId),
    enabled: !!eventId && !!memberId,
  })
}

export function useUpdateNotificationPrefsMutation() {
  const { slug, memberId } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<
    { eventId: string; memberId: string; prefs: NotificationPrefs },
    NotificationPrefs
  >(updateNotificationPrefs, {
    successMessage: 'Notification preferences saved',
    errorMessage: 'Failed to save preferences',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.settingsNotifications(slug, memberId) })
    },
  })
}
