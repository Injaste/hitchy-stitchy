import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Plus, Snowflake, UserX, Users } from "lucide-react";

import Odometer from "@/components/animations/animate-odometer";
import { itemRevealInUp } from "@/lib/animations";

import { isActiveMember } from "@/pages/admin/utils/memberUtils";

import { Button } from "@/components/ui/button";
import {
  ActionLabel,
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import { useAdminStore } from "../../store/useAdminStore";
import type { Member } from "../types";

interface MembersHeaderProps extends BaseHeaderProps {
  data?: Member[];
}

const MembersHeader: FC<MembersHeaderProps> = ({
  data,
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { isAdmin } = useAdminStore();
  const { canCreate } = useAccess();
  const openInvite = useMemberModalStore((s) => s.openCreate);

  const total = data?.length ?? 0;
  const active = data?.filter(isActiveMember).length ?? 0;
  const pending =
    data?.filter((m) => !m.frozen_at && m.joined_at === null).length ?? 0;
  const frozen = data?.filter((m) => m.frozen_at).length ?? 0;
  const rejected = data?.filter((m) => m.rejected_at !== null).length ?? 0;

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

  const meta = !isLoading && !isError && total > 0 && (
    <motion.div layout className="grid grid-cols-2 gap-x-8 gap-y-2 w-fit">
      <AnimatePresence>
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

  return (
    <PageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Members"
      description="Everyone with access to this event. Manage who's on your team and control their active status."
      meta={meta || undefined}
      action={
        canCreate("members") && (
          <Button
            size="sm"
            variant="default"
            onClick={openInvite}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />{" "}
            <ActionLabel>Invite member</ActionLabel>
          </Button>
        )
      }
    />
  );
};

export default MembersHeader;
