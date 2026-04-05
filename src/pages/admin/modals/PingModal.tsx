import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

import { usePingStore } from '../store/usePingStore'

export function PingModal() {
  const { isOpen, targetRoleId, close } = usePingStore()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send a Ping</DialogTitle>
          <DialogDescription>
            Nudge a team member to check in.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {targetRoleId
              ? `Pinging role: ${targetRoleId}`
              : 'Select a role to ping'}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={close}>
            <Send className="h-4 w-4 mr-2" />
            Send Ping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
