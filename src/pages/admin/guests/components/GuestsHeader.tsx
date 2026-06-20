import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import { ActionLabel, type BaseHeaderProps } from "@/components/custom/page-header-base";

import { useAccess } from "../../hooks/useAccess";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { dayLabel } from "../../days/utils";
import { useInvitationsQuery } from "../../invitation/queries";
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
  const canAdd = canCreate("guests");

  // Mirror the guests rail's effective day in the header (label only). Guests only
  // rail days that have an invitation page, so pick the same effective day as
  // GuestsView.
  const { days, activeDayId } = useActiveEventDay();
  const { data: invitations } = useInvitationsQuery();
  const invitationDays = days.filter((d) =>
    (invitations ?? []).some((i) => i.day_id === d.id),
  );
  const effectiveDayId = invitationDays.some((d) => d.id === activeDayId)
    ? activeDayId
    : (invitationDays[0]?.id ?? null);
  const effectiveIndex = days.findIndex((d) => d.id === effectiveDayId);
  const daySuffix =
    invitationDays.length > 1
      ? dayLabel(days[effectiveIndex]?.label, effectiveIndex)
      : null;

  return (
    <AdminPageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Guests"
      titleSuffix={
        daySuffix && (
          <div className="flex min-w-0 items-center text-sm font-medium text-muted-foreground sm:text-base">
            <span className="min-w-0 truncate">{daySuffix}</span>
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
