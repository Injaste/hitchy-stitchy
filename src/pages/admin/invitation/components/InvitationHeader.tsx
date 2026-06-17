import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import { ActionLabel, type BaseHeaderProps } from "@/components/custom/page-header-base";
import { useAccess } from "@/pages/admin/hooks/useAccess";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";

interface InvitationHeaderProps extends BaseHeaderProps {}

const InvitationHeader: FC<InvitationHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const openBrowse = useInvitationModalStore((s) => s.openBrowse);
  const { canCreate } = useAccess();

  return (
    <AdminPageHeader
      title="Invitation"
      description="Design and configure your wedding RSVP pages. Add a page per day or segment, customise the look, and control how guests respond."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      action={
        canCreate("invitation") && (
          <Button size="sm" className="gap-0" onClick={openBrowse}>
            <Plus className="size-3.5" />
            <ActionLabel>Invitation</ActionLabel>
          </Button>
        )
      }
    />
  );
};

export default InvitationHeader;
