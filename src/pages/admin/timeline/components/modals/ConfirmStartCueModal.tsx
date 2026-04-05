import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

import { useStartCueMutation } from '../../queries'
import { useCueStore } from '../../../store/useCueStore'
import type { TimelineEvent } from '../../types'

interface ConfirmStartCueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: TimelineEvent | null
}

export function ConfirmStartCueModal({ open, onOpenChange, event }: ConfirmStartCueModalProps) {
  const { setActiveCue } = useCueStore()

  const { mutate: startCue, isPending } = useStartCueMutation()

  const handleConfirm = () => {
    if (!event) return
    startCue(event.id)
    setActiveCue({
      id: event.id,
      title: event.title,
      timeStart: event.timeStart,
      dayId: event.dayId,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Start Cue</DialogTitle>
          <DialogDescription>
            This will mark "{event?.title}" as the active cue for the event.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            <Play className="h-4 w-4 mr-2" />
            Start Cue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
