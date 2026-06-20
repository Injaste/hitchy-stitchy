import type { FC, ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/custom/dashboard-page-header";
import { ActionLabel } from "@/components/custom/page-header-base";

interface DashboardHeaderProps {
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  onCreateEvent: () => void;
  name?: string | null;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({
  isLoading,
  isFetching,
  refetch,
  onCreateEvent,
  name,
}) => {
  const action: ReactNode = (
    <Button size="sm" className="gap-0" onClick={onCreateEvent}>
      <Plus className="size-3.5" />
      <ActionLabel>New event</ActionLabel>
    </Button>
  );

  // Greet by first name when the account has one; fall back to the neutral title
  // for older accounts that predate profiles.name (still NULL until they edit it).
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <DashboardPageHeader
      title={
        firstName ? `Welcome back, ${firstName}` : "Your Planning Dashboard"
      }
      description="Every celebration you're part of, all in one place."
      action={action}
      isLoading={isLoading}
      isRefetching={isFetching}
      refetch={refetch}
    />
  );
};

export default DashboardHeader;
