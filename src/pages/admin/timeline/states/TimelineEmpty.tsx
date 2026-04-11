import type { FC } from "react";
import { CalendarClock, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineEmptyProps {
  onAdd: () => void;
  canCreate: boolean;
}

const TimelineEmpty: FC<TimelineEmptyProps> = ({ onAdd, canCreate }) => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center text-center py-24 px-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <CalendarClock className="w-9 h-9 text-primary" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-foreground mb-2">
          No timeline yet
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
          Start building your day. Add your first schedule item and bring your
          wedding timeline to life.
        </p>
        {canCreate && (
          <Button onClick={onAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add first item
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineEmpty;
