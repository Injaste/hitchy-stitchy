import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useAdminStore } from '../../store/useAdminStore'
import { useAppearanceQuery, useUpdateAppearanceMutation } from './queries'

export function AppearanceSection() {
  const { eventId } = useAdminStore()
  const { data: config, isLoading } = useAppearanceQuery()
  const { mutate: save, isPending } = useUpdateAppearanceMutation()

  const [templateId, setTemplateId] = useState('')
  const [primaryColor, setPrimaryColor] = useState('')

  useEffect(() => {
    if (config) {
      setTemplateId(config.templateId)
      setPrimaryColor(config.primaryColor)
    }
  }, [config])

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />

  const handleSave = () => {
    save({ eventId, config: { templateId, primaryColor } })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="template">Template</Label>
          <Input id="template" value={templateId} onChange={(e) => setTemplateId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primary-color">Primary Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="primary-color" type="color" value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
          </div>
        </div>
      </div>
      <Button size="sm" onClick={handleSave} disabled={isPending}>Save</Button>
    </div>
  )
}
