import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CalendarDays } from "lucide-react";

import Odometer from "@/components/animations/animate-odometer";
import { itemRevealInUp } from "@/lib/animations";
import type { EventsCount } from "../types";

interface DashboardStatsProps {
  eventsCount: EventsCount;
}

type StatItem = { icon: typeof CalendarCheck; value: number; label: string };

const DashboardStats: FC<DashboardStatsProps> = ({ eventsCount }) => {
  const statItems = (
    [
      eventsCount.active > 0 && {
        icon: CalendarCheck,
        value: eventsCount.active,
        label: "active",
      },
      eventsCount.upcoming > 0 && {
        icon: CalendarDays,
        value: eventsCount.upcoming,
        label: "upcoming",
      },
    ] as (StatItem | false)[]
  ).filter(Boolean) as StatItem[];

  if (!statItems.length) return null;

  return (
    <motion.div layout className="grid grid-cols-2 gap-x-8 gap-y-2 w-fit">
      <AnimatePresence initial={false}>
        {statItems.map(({ icon: Icon, value, label }) => (
          <motion.div
            key={label}
            layout
            {...itemRevealInUp}
            className="flex items-center gap-1.5 text-muted-foreground overflow-hidden"
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-foreground">
              <Odometer value={value} />
            </span>
            <span>{label}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardStats;
