import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUpdateRSVPStatusMutation } from '../queries'
import type { RSVPEntry, RSVPStatus } from '../types'

interface RSVPTableProps {
  rsvps: RSVPEntry[]
  onViewDetail: (rsvp: RSVPEntry) => void
}

const statusBadge: Record<RSVPStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  confirmed: { label: 'Confirmed', variant: 'default' },
  pending: { label: 'Pending', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

export function RSVPTable({ rsvps, onViewDetail }: RSVPTableProps) {
  const { mutate: updateStatus } = useUpdateRSVPStatusMutation()

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Guests</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Submitted</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((rsvp) => {
              const badge = statusBadge[rsvp.status]
              return (
                <tr
                  key={rsvp.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onViewDetail(rsvp)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{rsvp.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rsvp.guest_count}</td>
                  <td className="px-4 py-3">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(rsvp.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {rsvp.status !== 'confirmed' && (
                      <Button
                        size="sm" variant="outline" className="text-xs h-7 mr-1"
                        onClick={() => updateStatus({ id: rsvp.id, status: 'confirmed' })}
                      >
                        Confirm
                      </Button>
                    )}
                    {rsvp.status !== 'cancelled' && (
                      <Button
                        size="sm" variant="ghost" className="text-xs h-7 text-destructive"
                        onClick={() => updateStatus({ id: rsvp.id, status: 'cancelled' })}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
