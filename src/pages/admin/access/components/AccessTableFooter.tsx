import { type FC } from "react";
import { cn } from "@/lib/utils";
import type { AccessLevel } from "../types";
import { ACCESS_CONFIG } from "./access-config";

interface AccessTableFooterProps {
  colCount: number;
}

const AccessTableFooter: FC<AccessTableFooterProps> = ({ colCount }) => (
  <tfoot className="sticky bottom-0 z-10 bg-card">
    <tr className="border-t border-border/40 bg-muted/20">
      <td colSpan={colCount} className="px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {(
            Object.entries(ACCESS_CONFIG) as [
              AccessLevel,
              (typeof ACCESS_CONFIG)[AccessLevel],
            ][]
          ).map(([level, { icon: Icon, label, className }]) => (
            <span
              key={level}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                className,
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {level === "none" ? "No access" : label}
            </span>
          ))}
        </div>
      </td>
    </tr>
  </tfoot>
);

export default AccessTableFooter;
