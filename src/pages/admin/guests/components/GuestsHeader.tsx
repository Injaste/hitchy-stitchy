import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import { ActionLabel, type BaseHeaderProps } from "@/components/custom/page-header-base";

import { useAccess } from "../../hooks/useAccess";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import {
  useInvitationsQuery,
  useEventSegmentsQuery,
} from "../../invitation/queries";
import { pageLabel } from "../../invitation/utils";
import { useGuestModalStore } from "../hooks/useGuestModalStore";
import type { Guest } from "../types";

interface GuestsHeaderProps extends BaseHeaderProps {
  data?: Guest[];
}

const GuestsHeader: FC<GuestsHeaderProps> = ({
  data,
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { canCreate } = useAccess();
  const openCreate = useGuestModalStore((s) => s.openCreate);
  const activeInvitationId = useGuestModalStore((s) => s.activeInvitationId);
  const canAdd = canCreate("guests");

  // Guests scope by invitation page, so the header mirrors the focused page's
  // label (segment ?? day). Nothing when "All pages" is in view.
  const { days } = useActiveEventDay();
  const { data: invitations } = useInvitationsQuery();
  const { data: segments } = useEventSegmentsQuery();
  const focusedPage = invitations?.find((i) => i.id === activeInvitationId);
  const pageSuffix = focusedPage
    ? pageLabel(focusedPage, days, segments ?? [])
    : null;

  return (
    <AdminPageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Guests"
      titleSuffix={
        pageSuffix && (
          <div className="flex min-w-0 items-center text-sm font-medium text-muted-foreground sm:text-base">
            <span className="min-w-0 truncate">{pageSuffix}</span>
          </div>
        )
      }
      description="Your full guest list and their RSVP responses."
      action={
        canAdd && (
          <Button
            size="sm"
            variant="default"
            onClick={openCreate}
            className="gap-0"
          >
            <Plus className="w-4 h-4" /> <ActionLabel>Guest</ActionLabel>
          </Button>
        )
      }
    />
  );
};

export default GuestsHeader;
