import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useAdminStore } from '../../store/useAdminStore'
import { useRSVPConfigQuery, useUpdateRSVPConfigMutation } from './queries'

export function RSVPConfigSection() {
  const { eventId } = useAdminStore()
  const { data: config, isLoading } = useRSVPConfigQuery()
  const { mutate: save, isPending } = useUpdateRSVPConfigMutation()

  const [showPhone, setShowPhone] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  const [showDietary, setShowDietary] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [showGuestsCount, setShowGuestsCount] = useState(true)

  useEffect(() => {
    if (config) {
      setShowPhone(config.showPhone)
      setShowEmail(config.showEmail)
      setShowDietary(config.showDietary)
      setShowMessage(config.showMessage)
      setShowGuestsCount(config.showGuestsCount)
    }
  }, [config])

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />

  const handleSave = () => {
    if (!config) return
    save({
      eventId,
      config: {
        ...config,
        showPhone, showEmail, showDietary, showMessage, showGuestsCount,
      },
    })
  }

  const fields = [
    { label: 'Phone number', checked: showPhone, onChange: setShowPhone },
    { label: 'Email', checked: showEmail, onChange: setShowEmail },
    { label: 'Dietary notes', checked: showDietary, onChange: setShowDietary },
    { label: 'Message', checked: showMessage, onChange: setShowMessage },
    { label: 'Guest count', checked: showGuestsCount, onChange: setShowGuestsCount },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">RSVP Form Fields</h3>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center justify-between">
            <Label className="text-sm">{field.label}</Label>
            <Switch checked={field.checked} onCheckedChange={field.onChange} />
          </div>
        ))}
      </div>
      <Button size="sm" onClick={handleSave} disabled={isPending}>Save</Button>
    </div>
  )
}
