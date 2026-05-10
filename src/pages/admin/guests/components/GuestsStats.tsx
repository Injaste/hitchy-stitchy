import type { FC } from "react";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";

import type { Guest } from "../types";

interface GuestsStatsProps {
  guests: Guest[];
}

const GuestsStats: FC<GuestsStatsProps> = ({ guests }) => {
  const confirmed = guests.filter((g) => g.status === "confirmed");
  const pending = guests.filter((g) => g.status === "pending");
  const cancelled = guests.filter((g) => g.status === "cancelled");

  const stats = [
    {
      label: "Total RSVPs",
      value: guests.length,
      sub: null,
      icon: Users,
      iconClass: "text-muted-foreground",
    },
    {
      label: "Confirmed",
      value: confirmed.length,
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
    },
    {
      label: "Pending",
      value: pending.length,
      sub: null,
      icon: Clock,
      iconClass: "text-amber-500",
    },
    {
      label: "Cancelled",
      value: cancelled.length,
      sub: null,
      icon: XCircle,
      iconClass: "text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card px-5 py-4"
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                {stat.label}
              </p>
              <Icon size={20} className={stat.iconClass} />
            </div>
            <p className="font-display text-3xl font-semibold text-foreground leading-none">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default GuestsStats;
