import { Users, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { RSVPEntry } from '../types'

interface RSVPStatsProps {
  rsvps: RSVPEntry[]
}

export function RSVPStats({ rsvps }: RSVPStatsProps) {
  const confirmed = rsvps.filter((r) => r.status === 'confirmed')
  const pending = rsvps.filter((r) => r.status === 'pending')
  const declined = rsvps.filter((r) => r.status === 'declined')
  const totalGuests = confirmed.reduce((sum, r) => sum + r.guestsCount, 0)

  const stats = [
    { label: 'Total', value: rsvps.length, icon: Users, className: 'text-foreground' },
    { label: 'Confirmed', value: confirmed.length, icon: CheckCircle2, className: 'text-primary' },
    { label: 'Pending', value: pending.length, icon: Clock, className: 'text-amber-500' },
    { label: 'Declined', value: declined.length, icon: XCircle, className: 'text-destructive' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
          <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.className}`} />
          <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
      <div className="col-span-2 md:col-span-4 rounded-xl border border-border bg-card p-3 text-center">
        <p className="text-sm text-muted-foreground">
          Total confirmed guests: <span className="font-semibold text-foreground">{totalGuests}</span>
        </p>
      </div>
    </div>
  )
}
