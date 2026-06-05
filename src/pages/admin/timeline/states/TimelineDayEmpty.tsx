import type { FC } from "react";
import { CalendarPlus, Plus } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseLocalDate } from "@/lib/utils/utils-time";

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
  const date = day ? parseLocalDate(day) : null;

  return (
    <Card className="border-dashed bg-muted/20 ring-0 shadow-none">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        {date ? (
          <div className="mb-5 w-16 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="bg-primary/90 py-1 text-center text-2xs font-semibold uppercase tracking-widest text-primary-foreground">
              {format(date, "MMM")}
            </div>
            <div className="py-2">
              <div className="font-display text-2xl font-bold leading-none text-foreground">
                {format(date, "d")}
              </div>
              <div className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground">
                {format(date, "EEE")}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-primary/30 bg-primary/10">
            <CalendarPlus className="h-6 w-6 text-primary/70" />
          </div>
        )}

        <h3 className="mb-1.5 font-display text-lg font-medium text-foreground">
          Nothing scheduled yet
        </h3>
        <p className="mb-6 max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
          This day is a blank canvas. Add your first item to start shaping the
          schedule.
        </p>

        {canCreate && (
          <Button onClick={onAdd} className="gap-1">
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineDayEmpty;
