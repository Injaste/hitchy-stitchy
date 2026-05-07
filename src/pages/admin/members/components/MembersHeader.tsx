import type { FC } from "react";
import { Clock, Plus, Snowflake, UserX, Users } from "lucide-react";

import { isActiveMember } from "@/pages/admin/utils/memberUtils";

import { Button } from "@/components/ui/button";
import {
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
    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
      {statItems.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium text-foreground">{value}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <PageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
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
            <Plus className="w-4 h-4" /> Invite member
          </Button>
        )
      }
    />
  );
};

export default MembersHeader;
