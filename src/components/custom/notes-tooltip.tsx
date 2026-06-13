import { MessageSquare } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NotesTooltipProps {
  /** The note text. Renders nothing when empty. */
  notes: string | null | undefined;
  /** Tooltip side. Defaults to "top". */
  side?: "top" | "right" | "bottom" | "left";
  /** Extra classes for the icon (e.g. positioning). */
  className?: string;
}

/**
 * A small notes icon that reveals the note on hover — renders nothing when there
 * is no note. Shared across the guest, budget and gift ledgers. Self-contained
 * (carries its own TooltipProvider) so it drops into any row.
 */
const NotesTooltip = ({ notes, side = "top", className }: NotesTooltipProps) => {
  if (!notes?.trim()) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <MessageSquare
            className={cn(
              "w-3 h-3 shrink-0 cursor-help text-muted-foreground",
              className,
            )}
            strokeWidth={2.5}
          />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-56 text-xs">
          {notes}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotesTooltip;
