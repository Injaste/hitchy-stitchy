import type { FC } from "react"

import type { Guest } from "../types"

interface GuestsStatsProps {
  guests: Guest[]
}

const GuestsStats: FC<GuestsStatsProps> = ({ guests }) => {
  const confirmed = guests.filter((g) => g.status === "confirmed")
  const pending = guests.filter((g) => g.status === "pending")
  const cancelled = guests.filter((g) => g.status === "cancelled")
  const attendingCount = confirmed.reduce((sum, g) => sum + g.guest_count, 0)

  const stats = [
    { label: "Total RSVPs", value: guests.length, sub: null },
    {
      label: "Confirmed",
      value: confirmed.length,
      sub: attendingCount > 0 ? `${attendingCount} attending` : null,
    },
    { label: "Pending", value: pending.length, sub: null },
    { label: "Cancelled", value: cancelled.length, sub: null },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1.5">
            {stat.label}
          </p>
          <p className="font-display text-3xl font-semibold text-foreground leading-none">
            {stat.value}
          </p>
          {stat.sub && (
            <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default GuestsStats
