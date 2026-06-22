import type { FC } from "react";
import {
  Clock,
  XCircle,
  CheckCircle,
  ClipboardList,
} from "lucide-react";

import type { Guest } from "../types";
import Odometer from "@/components/animations/animate-odometer";

interface GuestsStatsProps {
  guests: Guest[];
}

const GuestsStats: FC<GuestsStatsProps> = ({ guests }) => {
  const stats = guests.reduce(
    (acc, g) => {
      acc.total++;
      if (g.status === "confirmed") {
        acc.confirmed++;
        acc.confirmedPax += g.guest_count ?? 1;
      } else if (g.status === "pending") {
        acc.pending++;
      } else if (g.status === "cancelled") {
        acc.cancelled++;
      }
      return acc;
    },
    { total: 0, confirmed: 0, confirmedPax: 0, pending: 0, cancelled: 0 },
  );

  const cells = [
    {
      label: "Total",
      value: stats.total,
      icon: ClipboardList,
      iconClass: "text-muted-foreground",
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      sub: `${stats.confirmedPax} attending`,
      icon: CheckCircle,
      iconClass: "text-success",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      iconClass: "text-warning",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      iconClass: "text-destructive",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border text-card-foreground shadow-xs ring-1 ring-foreground/10 sm:grid-cols-4">
      {cells.map((cell) => {
        const Icon = cell.icon;
        return (
          <div key={cell.label} className="bg-card px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Icon className={cell.iconClass} size={18} />
              <span className="font-display text-xl font-semibold leading-none text-foreground">
                <Odometer value={cell.value} />
              </span>
              <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                {cell.label}
              </span>
            </div>
            {cell.sub && (
              <p className="mt-0.5 truncate pl-7 text-2xs text-muted-foreground">
                {cell.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GuestsStats;
