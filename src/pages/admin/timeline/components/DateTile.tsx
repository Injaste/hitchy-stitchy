import type { FC } from "react";
import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { parseLocalDate } from "@/lib/utils/utils-time";
import { cn } from "@/lib/utils";

interface DateTileProps {
  /** Day to render, as "yyyy-MM-dd". */
  date: string;
  /** Primary (selected) header treatment when true; muted when false. */
  active?: boolean;
  className?: string;
  /** Extra header classes — e.g. a hover state driven by a group parent. */
  headerClassName?: string;
}

/**
 * Calendar tile showing month, day-of-month, and weekday. Renders on the shared
 * `Card` surface so it looks consistent standalone; wrap it in a behavioral
 * shell (button, link, …) for interactivity. Hover/group effects on the month
 * header come in via `headerClassName` so the tile stays context-agnostic.
 */
const DateTile: FC<DateTileProps> = ({
  date,
  active = true,
  className,
  headerClassName,
}) => {
  const parsed = parseLocalDate(date);
  return (
    <Card className={cn("w-16 gap-0 py-0 text-center", className)}>
      <div
        className={cn(
          "py-1 text-2xs font-semibold uppercase tracking-widest transition-colors",
          active
            ? "bg-primary/90! text-primary-foreground"
            : "bg-muted text-muted-foreground",
          headerClassName,
        )}
      >
        {format(parsed, "MMM")}
      </div>
      <div className="py-2">
        <div className="font-display text-2xl font-bold leading-none text-foreground">
          {format(parsed, "d")}
        </div>
        <div className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground">
          {format(parsed, "EEE")}
        </div>
      </div>
    </Card>
  );
};

export default DateTile;
