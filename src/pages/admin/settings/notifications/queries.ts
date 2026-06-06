import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { useAdminStore } from "../../store/useAdminStore"
import { adminKeys } from "../../lib/queryKeys"
import { getNotificationPrefs, setNotificationPrefs } from "./api"
import type { NotificationPrefs } from "./types"

export function useNotificationPrefsQuery() {
  const { slug, memberId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.settingsNotifications(slug!, memberId!),
    queryFn: () => getNotificationPrefs(memberId!),
    enabled: !!slug && !!memberId,
  })
}

/**
 * Toggle one or more feature flags. Optimistic so switches feel instant; rolls
 * back on error and reconciles to the server's returned prefs on success.
 */
export function useSetNotificationPrefsMutation() {
  const { slug, memberId, eventId } = useAdminStore()
  const qc = useQueryClient()
  const key = adminKeys.settingsNotifications(slug!, memberId!)

  return useMutation<NotificationPrefs, NotificationPrefs, { prev?: NotificationPrefs }>(
    (notifications) => setNotificationPrefs(eventId!, notifications),
    {
      silent: true,
      onMutate: async (notifications) => {
        await qc.cancelQueries({ queryKey: key })
        const prev = qc.getQueryData<NotificationPrefs>(key)
        qc.setQueryData<NotificationPrefs>(key, (old) => ({ ...(old ?? {}), ...notifications }))
        return { prev }
      },
      onSuccess: (result) => {
        qc.setQueryData(key, result)
      },
      onError: (_err, _args, ctx) => {
        if (ctx?.prev) qc.setQueryData(key, ctx.prev)
      },
    },
  )
}
