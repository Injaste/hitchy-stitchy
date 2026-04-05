import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

import { useCueStore } from '../store/useCueStore'

export function ActiveCueModal() {
  const { activeCue, isCueModalOpen, closeCueModal } = useCueStore()

  return (
    <Dialog open={isCueModalOpen} onOpenChange={(open) => { if (!open) closeCueModal() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Active Cue</DialogTitle>
          <DialogDescription>
            Currently live event cue details.
          </DialogDescription>
        </DialogHeader>

        {activeCue ? (
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary fill-primary" />
              <span className="font-medium text-foreground">{activeCue.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Started at {activeCue.timeStart}
            </p>
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            No active cue at the moment.
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={closeCueModal}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
