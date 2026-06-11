import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";

import Odometer from "@/components/animations/animate-odometer";
import { itemRevealInUp } from "@/lib/animations";
import { useAccess } from "../../hooks/useAccess";
import type { Member, MemberStatusLabel } from "../types";
import { getMemberStatus, MEMBER_STATUS_CONFIG } from "../utils";

interface MemberStatsProps {
  data?: Member[];
  isLoading: boolean;
  isError: boolean;
}

const MemberStats: FC<MemberStatsProps> = ({ data, isLoading, isError }) => {
  const { isSuperAdmin } = useAccess();

  if (isLoading || isError || !data?.length) return null;

  // Derive counts from a single canonical status per member — no double-counting.
  const counts = data.reduce(
    (acc, m) => { acc[getMemberStatus(m)]++; return acc; },
    { active: 0, pending: 0, expired: 0, frozen: 0 } as Record<MemberStatusLabel, number>,
  );

  type StatItem = { icon: typeof Users; value: number; label: string };

  const memberStat: StatItem = {
    icon: Users,
    value: counts.active,
    label: counts.active === 1 ? "member" : "members",
  };

  const toStatItems = (statuses: MemberStatusLabel[]): StatItem[] =>
    statuses
      .filter((s) => counts[s] > 0)
      .map((s) => ({ icon: MEMBER_STATUS_CONFIG[s].icon, value: counts[s], label: s }));

  const statItems: StatItem[] = [
    memberStat,
    // Pending/expired visible to everyone; frozen only to superadmins.
    ...toStatItems(["pending", "expired"]),
    ...(isSuperAdmin ? toStatItems(["frozen"]) : []),
  ];

  return (
    <motion.div layout className="grid grid-cols-2 gap-x-8 gap-y-2 w-fit">
      <AnimatePresence initial={false}>
        {statItems.map(({ icon: Icon, value, label }) => (
          <motion.div
            key={label}
            layout
            {...itemRevealInUp}
            className="flex items-center gap-1.5 text-muted-foreground overflow-hidden text-sm"
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

export default MemberStats;
