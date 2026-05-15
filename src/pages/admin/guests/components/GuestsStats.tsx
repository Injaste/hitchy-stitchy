import type { FC } from "react";
import {
  Clock,
  XCircle,
  CheckCircle,
  ClipboardList,
  Users,
} from "lucide-react";

import type { Guest } from "../types";
import OdometerDigit from "@/components/animations/animate-odometer-digit";

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
    {
      total: 0,
      confirmed: 0,
      confirmedPax: 0,
      pending: 0,
      cancelled: 0,
    },
  );

  const cards = [
    {
      label: "Confirmed",
      value: stats.confirmed,
      sub: `${stats.confirmedPax} attending`,
      icon: CheckCircle,
      iconClass: "text-emerald-500",
    },
    {
      label: "Total RSVPs",
      value: stats.total,
      icon: ClipboardList,
      iconClass: "text-muted-foreground",
    },
    {
      label: "Pending",
      value: stats.pending,
      sub: null,
      icon: Clock,
      iconClass: "text-amber-500",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      sub: null,
      icon: XCircle,
      iconClass: "text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card px-5 py-4"
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                {card.label}
              </p>
              <Icon size={20} className={card.iconClass} />
            </div>
            <div className="font-display text-3xl font-semibold text-foreground leading-none">
              {String(card.value)
                .split("")
                .map((d, i) => (
                  <OdometerDigit key={i} value={Number(d)} />
                ))}
            </div>
            {card.sub && (
              <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                <Users size={11} />
                {card.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GuestsStats;
