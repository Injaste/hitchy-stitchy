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
}

const DashboardHeader: FC<DashboardHeaderProps> = ({
  isLoading,
  isFetching,
  refetch,
  onCreateEvent,
}) => {
  const action: ReactNode = (
    <Button size="sm" className="gap-0" onClick={onCreateEvent}>
      <Plus className="size-3.5" />
      <ActionLabel>New event</ActionLabel>
    </Button>
  );

  return (
    <DashboardPageHeader
      title="Planning Dashboard"
      description="All your celebrations in one place."
      action={action}
      isLoading={isLoading}
      isRefetching={isFetching}
      refetch={refetch}
    />
  );
};

export default DashboardHeader;
