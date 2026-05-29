import type { FC, ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/custom/dashboard-page-header";
import { ActionLabel } from "@/components/custom/page-header-base";
import type { EventsCount } from "../types";

interface DashboardHeaderProps {
  eventsCount: EventsCount;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  onCreateEvent: () => void;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({
  eventsCount,
  isLoading,
  isFetching,
  refetch,
  onCreateEvent,
}) => {
  const stats = [
    { label: "Invited", value: eventsCount.pending },
    { label: "Active", value: eventsCount.active },
    { label: "Upcoming", value: eventsCount.upcoming },
  ].filter((s) => s.value > 0);

  const meta: ReactNode =
    stats.length > 0 ? (
      <div className="flex items-center gap-5">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {s.label}
            </p>
            <p className="text-lg font-bold text-foreground leading-none">
              {s.value}
            </p>
          </div>
        ))}
      </div>
    ) : undefined;

  const action: ReactNode = (
    <Button size="sm" className="gap-0" onClick={onCreateEvent}>
      <Plus className="size-3.5" />
      <ActionLabel>New event</ActionLabel>
    </Button>
  );

  return (
    <DashboardPageHeader
      title="Planning Dashboard"
      description="Manage and track all your upcoming events."
      meta={meta}
      action={action}
      isLoading={isLoading}
      isRefetching={isFetching}
      refetch={refetch}
    />
  );
};

export default DashboardHeader;
