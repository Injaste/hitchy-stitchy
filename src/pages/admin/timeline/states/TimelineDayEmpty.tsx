import type { FC } from "react";
import { CalendarPlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/states/empty-state";
import DateTile from "@/components/custom/date-tile";

interface TimelineDayEmptyProps {
  canCreate: boolean;
  onAdd: () => void;
  /** The selected day ("yyyy-MM-dd"), rendered as a calendar tile. */
  day?: string | null;
}

const TimelineDayEmpty: FC<TimelineDayEmptyProps> = ({
  canCreate,
  onAdd,
  day,
}) => {
  const icon = day ? (
    <DateTile date={day} />
  ) : (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-primary/30 bg-primary/10">
      <CalendarPlus className="h-6 w-6 text-primary/70" />
    </div>
  );

  return (
    <EmptyState
      icon={icon}
      title="Nothing scheduled yet"
      description="This day is a blank canvas. Add your first item to start shaping the schedule."
      action={
        canCreate ? (
          <Button onClick={onAdd} className="gap-1">
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        ) : undefined
      }
    />
  );
};

export default TimelineDayEmpty;
