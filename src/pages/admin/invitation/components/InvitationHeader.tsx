import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import { ActionLabel, type BaseHeaderProps } from "@/components/custom/page-header-base";
import { useAccess } from "@/pages/admin/hooks/useAccess";
import { useLimitGuard } from "@/pages/admin/plan/hooks/useLimitGuard";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";

interface InvitationHeaderProps extends BaseHeaderProps {}

const InvitationHeader: FC<InvitationHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const openBrowse = useInvitationModalStore((s) => s.openBrowse);
  const guardAdd = useLimitGuard();
  const { canCreate } = useAccess();

  return (
    <AdminPageHeader
      title="Invitation"
      description="Design the pages your guests will open. Make one per day, style it your way, and choose how they RSVP."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      action={
        canCreate("invitation") && (
          <Button
            size="sm"
            className="gap-0"
            onClick={() => {
              if (guardAdd("pages")) return;
              openBrowse();
            }}
          >
            <Plus className="size-3.5" />
            <ActionLabel>Invitation</ActionLabel>
          </Button>
        )
      }
    />
  );
};

export default InvitationHeader;
