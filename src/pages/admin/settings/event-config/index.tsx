import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useAdminStore } from '../../store/useAdminStore'
import { useEventConfigQuery, useUpdateEventConfigMutation } from './queries'

export function EventConfigSection() {
  const { eventId } = useAdminStore()
  const { data: config, isLoading } = useEventConfigQuery()
  const { mutate: save, isPending } = useUpdateEventConfigMutation()

  const [eventName, setEventName] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  useEffect(() => {
    if (config) {
      setEventName(config.eventName)
      setDateStart(config.dateStart)
      setDateEnd(config.dateEnd)
    }
  }, [config])

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />

  const handleSave = () => {
    save({
      eventId,
      config: { eventName, dateStart, dateEnd, timezone: config?.timezone ?? '' },
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Event Configuration</h3>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="cfg-name">Event Name</Label>
          <Input id="cfg-name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cfg-start">Start Date</Label>
            <Input id="cfg-start" type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cfg-end">End Date</Label>
            <Input id="cfg-end" type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </div>
        </div>
      </div>
      <Button size="sm" onClick={handleSave} disabled={isPending}>Save</Button>
    </div>
  )
}
