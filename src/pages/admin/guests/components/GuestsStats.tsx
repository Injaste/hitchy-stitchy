import type { FC } from "react"
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react"

import type { Guest } from "../types"

interface GuestsStatsProps {
  guests: Guest[]
}

const GuestsStats: FC<GuestsStatsProps> = ({ guests }) => {
  const confirmed = guests.filter((g) => g.status === "confirmed")
  const pending = guests.filter((g) => g.status === "pending")
  const cancelled = guests.filter((g) => g.status === "cancelled")
  const totalGuests = confirmed.reduce((sum, g) => sum + g.guest_count, 0)

  const stats = [
    { label: "Total", value: guests.length, icon: Users, className: "text-foreground" },
    { label: "Confirmed", value: confirmed.length, icon: CheckCircle2, className: "text-primary" },
    { label: "Pending", value: pending.length, icon: Clock, className: "text-amber-500" },
    { label: "Cancelled", value: cancelled.length, icon: XCircle, className: "text-destructive" },
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
          Total confirmed guests:{" "}
          <span className="font-semibold text-foreground">{totalGuests}</span>
        </p>
      </div>
    </div>
  )
}

export default GuestsStats
