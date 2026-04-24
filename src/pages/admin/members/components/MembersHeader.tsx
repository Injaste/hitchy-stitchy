import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
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
  const { canCreate } = useAccess();
  const openInvite = useMemberModalStore((s) => s.openInvite);
  const total = data?.length ?? 0;
  const active = data?.filter((m) => !m.is_frozen).length ?? 0;

  return (
    <PageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      description="Everyone with access to this event. Manage who's on your team and control their active status."
      meta={
        total > 0 && (
          <span>
            {total} {total === 1 ? "member" : "members"}
            {active !== total && (
              <>
                <span className="mx-1.5">·</span>
                {active} active
              </>
            )}
          </span>
        )
      }
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
