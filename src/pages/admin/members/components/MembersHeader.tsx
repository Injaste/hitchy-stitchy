import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import { ActionLabel, type BaseHeaderProps } from "@/components/custom/page-header-base";

import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";

const MembersHeader: FC<BaseHeaderProps> = ({
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { canManageMembers } = useAccess();
  const openInvite = useMemberModalStore((s) => s.openCreate);

  return (
    <AdminPageHeader
      containerSize="md"
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Members"
      description="Everyone with access to this event. Manage who's on your team and control their active status."
      action={
        canManageMembers && (
          <Button
            size="sm"
            variant="default"
            onClick={openInvite}
            className="gap-0"
          >
            <Plus className="w-4 h-4" />
            <ActionLabel>Invite</ActionLabel>
          </Button>
        )
      }
    />
  );
};

export default MembersHeader;
