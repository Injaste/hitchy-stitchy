import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Snowflake, UserX, Users } from "lucide-react";

import Odometer from "@/components/animations/animate-odometer";
import { itemRevealInUp } from "@/lib/animations";
import { isActiveMember } from "@/pages/admin/utils/memberUtils";
import { useAdminStore } from "../../store/useAdminStore";
import type { Member } from "../types";

interface MemberStatsProps {
  data?: Member[];
  isLoading: boolean;
  isError: boolean;
}

const MemberStats: FC<MemberStatsProps> = ({ data, isLoading, isError }) => {
  const { isAdmin } = useAdminStore();

  if (isLoading || isError || !data?.length) return null;

  const active = data.filter(isActiveMember).length;
  const pending = data.filter((m) => !m.frozen_at && m.joined_at === null).length;
  const frozen = data.filter((m) => m.frozen_at).length;
  const rejected = data.filter((m) => m.rejected_at !== null).length;

  type StatItem = { icon: typeof Users; value: number; label: string };

  const memberStat: StatItem = {
    icon: Users,
    value: active,
    label: active === 1 ? "member" : "members",
  };

  const statItems: StatItem[] = !isAdmin
    ? [memberStat]
    : ([
        memberStat,
        pending > 0 && { icon: Clock, value: pending, label: "pending" },
        rejected > 0 && { icon: UserX, value: rejected, label: "rejected" },
        frozen > 0 && { icon: Snowflake, value: frozen, label: "frozen" },
      ].filter(Boolean) as StatItem[]);

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

export default MemberStats;
