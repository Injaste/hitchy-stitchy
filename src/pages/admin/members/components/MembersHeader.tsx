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
import ArraySeparator from "@/components/custom/array-separator";
import { useAdminStore } from "../../store/useAdminStore";

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
  const openInvite = useMemberModalStore((s) => s.openInvite);

  const total = data?.length ?? 0;
  const active =
    data?.filter((m) => !m.is_frozen && m.joined_at !== null).length ?? 0;
  const pending =
    data?.filter((m) => !m.is_frozen && m.joined_at === null).length ?? 0;
  const frozen = data?.filter((m) => m.is_frozen).length ?? 0;
  const rejected = data?.filter((m) => m.rejected_at !== null).length ?? 0;

  const metaItems =
    !isLoading &&
    !isError &&
    total > 0 &&
    (() => {
      if (isAdmin) {
        return [
          `${total} ${total === 1 ? "member" : "members"}`,
          active > 0 && `${active} active`,
          pending > 0 && `${pending} pending`,
          rejected > 0 && `${rejected} rejected`,
          frozen > 0 && `${frozen} frozen`,
        ].filter(Boolean);
      }
      return [`${active} ${active === 1 ? "member" : "members"}`];
    })();

  return (
    <PageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      description="Everyone with access to this event. Manage who's on your team and control their active status."
      meta={metaItems && <ArraySeparator items={metaItems} />}
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
