import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ActionLabel,
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import RolesSheet from "../../roles/components/RolesSheet";

const MembersHeader: FC<BaseHeaderProps> = ({
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { canCreate } = useAccess();
  const openInvite = useMemberModalStore((s) => s.openCreate);

  return (
    <PageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Members"
      description="Everyone with access to this event. Manage who's on your team and control their active status."
      action={
        <div className="flex items-center gap-2">
          <RolesSheet />
          {canCreate("members") && (
            <Button
              size="sm"
              variant="default"
              onClick={openInvite}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              <ActionLabel>Invite</ActionLabel>
            </Button>
          )}
        </div>
      }
    />
  );
};

export default MembersHeader;
