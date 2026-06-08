import type { FC } from "react";
import { CalendarClock, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/states/empty-state";

interface TimelineEmptyProps {
  onAdd: () => void;
  canCreate: boolean;
}

const TimelineEmpty: FC<TimelineEmptyProps> = ({ onAdd, canCreate }) => (
  <EmptyState
    icon={
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-dashed border-primary/20 flex items-center justify-center">
        <CalendarClock className="w-7 h-7 text-primary" />
      </div>
    }
    title="No timeline yet"
    description="Start building your day. Add your first schedule item and bring your wedding timeline to life."
    action={
      canCreate ? (
        <Button onClick={onAdd} className="gap-1">
          <Plus className="w-4 h-4" />
          Add first item
        </Button>
      ) : undefined
    }
  />
);

export default TimelineEmpty;
