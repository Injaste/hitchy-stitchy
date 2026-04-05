import { format } from 'date-fns'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RSVPEntry } from '../../types'

interface RSVPDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rsvp: RSVPEntry | null
}

export function RSVPDetailModal({ open, onOpenChange, rsvp }: RSVPDetailModalProps) {
  if (!rsvp) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{rsvp.name}</DialogTitle>
          <DialogDescription>RSVP details</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Row label="Status">
            <Badge variant={rsvp.status === 'confirmed' ? 'default' : rsvp.status === 'declined' ? 'destructive' : 'secondary'}>
              {rsvp.status}
            </Badge>
          </Row>
          <Row label="Guests">{rsvp.guestsCount}</Row>
          {rsvp.phone && <Row label="Phone">{rsvp.phone}</Row>}
          {rsvp.email && <Row label="Email">{rsvp.email}</Row>}
          {rsvp.dietaryNotes && <Row label="Dietary">{rsvp.dietaryNotes}</Row>}
          {rsvp.message && <Row label="Message">{rsvp.message}</Row>}
          <Row label="Submitted">{format(new Date(rsvp.submittedAt), 'MMM d, yyyy h:mm a')}</Row>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}
