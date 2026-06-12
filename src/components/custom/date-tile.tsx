import type { FC, ReactNode } from "react";
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
  /** Optional label rendered below the tile (centered, wraps, max 2 lines). */
  label?: ReactNode;
  /** When provided, the tile becomes an interactive button. */
  onClick?: () => void;
}

/**
 * Calendar tile showing month, day-of-month, and weekday. Optionally renders a
 * centered label beneath it (clamped to two lines within the tile's w-16) and
 * becomes a button when `onClick` is given — otherwise it's a static visual.
 * Shared across day-scoped admin features (timeline, budget).
 */
const DateTile: FC<DateTileProps> = ({
  date,
  active = true,
  className,
  headerClassName,
  label,
  onClick,
}) => {
  const parsed = parseLocalDate(date);

  const tile = (
    <Card className={cn("w-16 gap-0 py-0 text-center", className)}>
      <div
        className={cn(
          "py-1 text-2xs font-semibold uppercase tracking-widest transition-colors",
          active
            ? "bg-primary/90! text-primary-foreground"
            : "bg-muted text-muted-foreground",
          onClick && "group-hover/date-tile:bg-primary/30",
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

  // Back-compat: a static, unlabeled tile renders bare (e.g. TimelineDayEmpty).
  if (!onClick && label == null) return tile;

  return (
    <div className="flex w-16 flex-col items-center gap-1.5">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="group/date-tile cursor-pointer rounded-xl transition-transform active:scale-[0.95]"
        >
          {tile}
        </button>
      ) : (
        tile
      )}
      {label != null && (
        <div className="line-clamp-2 w-16 text-center text-xs wrap-break-word">
          {label}
        </div>
      )}
    </div>
  );
};

export default DateTile;
