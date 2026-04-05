import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

import { useCreateTimelineMutation, useUpdateTimelineMutation } from '../../queries'
import { useAdminStore } from '../../../store/useAdminStore'
import type { TimelineEvent } from '../../types'

interface TimelineEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: TimelineEvent | null
  dayId: string
}

export function TimelineEventModal({ open, onOpenChange, event, dayId }: TimelineEventModalProps) {
  const { eventId } = useAdminStore()
  const isEditing = !!event

  const [title, setTitle] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [isMainEvent, setIsMainEvent] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setTimeStart(event.timeStart)
      setDescription(event.description ?? '')
      setNotes(event.notes ?? '')
      setIsMainEvent(event.isMainEvent)
    } else {
      setTitle('')
      setTimeStart('')
      setDescription('')
      setNotes('')
      setIsMainEvent(false)
    }
  }, [event, open])

  const { mutate: create, isPending: creating } = useCreateTimelineMutation()
  const { mutate: update, isPending: updating } = useUpdateTimelineMutation()
  const isPending = creating || updating

  const handleSubmit = () => {
    if (!title.trim() || !timeStart.trim()) return
    if (isEditing && event) {
      update({ ...event, title, timeStart, description, notes, isMainEvent })
    } else {
      create({ eventId, dayId, title, timeStart, description, notes, isMainEvent, assignees: [] })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the timeline event details.' : 'Add a new event to the timeline.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeStart">Time</Label>
            <Input id="timeStart" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} placeholder="02:00 PM" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="mainEvent" checked={isMainEvent} onCheckedChange={setIsMainEvent} />
            <Label htmlFor="mainEvent">Main event</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !title.trim()}>
            {isEditing ? 'Save' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
