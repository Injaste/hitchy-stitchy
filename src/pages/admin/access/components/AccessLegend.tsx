import { Fragment, type FC } from "react";
import { cn } from "@/lib/utils";
import type { AccessLevel } from "../types";
import { ACCESS_CONFIG } from "./access-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccessLegendProps {
  className?: string;
}

/** Legend mapping each access level to its icon + label. Shared by the desktop
 * matrix footer and the mobile accordion. */
const AccessLegend: FC<AccessLegendProps> = ({ className }) => (
  <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-2", className)}>
    {(
      Object.entries(ACCESS_CONFIG) as [
        AccessLevel,
        (typeof ACCESS_CONFIG)[AccessLevel],
      ][]
    ).map(([level, { icon: Icon, label, hint, className: levelClass }]) => (
      <Fragment key={level}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs",
                  levelClass,
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {level === "none" ? "No access" : label}
              </span>
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Fragment>
    ))}
  </div>
);

export default AccessLegend;
