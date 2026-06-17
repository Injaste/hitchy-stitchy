import type { FC } from "react";
import { Clock, type LucideIcon } from "lucide-react";
import { parseISO, format, formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RelativeTimeProps {
  /** ISO timestamp. */
  date: string;
  /** Leading word, e.g. "Published" / "Edited". */
  prefix?: string;
  /** Leading icon (defaults to a clock). */
  icon?: LucideIcon;
  className?: string;
}

// Compact "{prefix} {n ago}" with a leading icon and the absolute date on hover.
// Reusable wherever a timestamp is shown (invitation cards, member history, …).
const RelativeTime: FC<RelativeTimeProps> = ({
  date,
  prefix,
  icon: Icon = Clock,
  className,
}) => {
  const d = parseISO(date);
  const relative = formatDistanceToNow(d, { addSuffix: true });
  const absolute = format(d, "d MMM yyyy, HH:mm");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs text-muted-foreground",
            className,
          )}
        >
          <Icon className="size-3 shrink-0" />
          {prefix ? `${prefix} ${relative}` : relative}
        </span>
      </TooltipTrigger>
      <TooltipContent>{absolute}</TooltipContent>
    </Tooltip>
  );
};

export default RelativeTime;
