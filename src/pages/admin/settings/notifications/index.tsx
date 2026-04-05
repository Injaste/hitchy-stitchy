import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useAdminStore } from '../../store/useAdminStore'
import { useNotificationPrefsQuery, useUpdateNotificationPrefsMutation } from './queries'
import type { NotificationPrefs } from './types'

type PrefKey = keyof NotificationPrefs

const prefLabels: Record<PrefKey, string> = {
  eventStarted: 'Event started',
  taskAssigned: 'Task assigned to me',
  pinged: 'Someone pinged me',
  upcomingEvent: 'Upcoming event reminder',
  bridesmaidsCheckin: 'Bridesmaid check-in',
}

export function NotificationsSection() {
  const { eventId, memberId } = useAdminStore()
  const { data: prefs, isLoading } = useNotificationPrefsQuery()
  const { mutate: save, isPending } = useUpdateNotificationPrefsMutation()

  const [localPrefs, setLocalPrefs] = useState<NotificationPrefs>({
    eventStarted: true,
    taskAssigned: true,
    pinged: true,
    upcomingEvent: true,
    bridesmaidsCheckin: true,
  })

  useEffect(() => {
    if (prefs) setLocalPrefs(prefs)
  }, [prefs])

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />

  const toggle = (key: PrefKey) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    save({ eventId, memberId, prefs: localPrefs })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
      <div className="space-y-3">
        {(Object.keys(prefLabels) as PrefKey[]).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-sm">{prefLabels[key]}</Label>
            <Switch checked={localPrefs[key]} onCheckedChange={() => toggle(key)} />
          </div>
        ))}
      </div>
      <Button size="sm" onClick={handleSave} disabled={isPending}>Save</Button>
    </div>
  )
}
