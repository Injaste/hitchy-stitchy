import type { FC } from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccessGroup } from "../types";

interface AccessTableHeaderProps {
  accessGroups: AccessGroup[];
  memberCounts: Record<string, number>;
  /** Percentage width applied to each group column (min-width keeps them legible). */
  groupColWidth: string;
}

const AccessTableHeader: FC<AccessTableHeaderProps> = ({
  accessGroups,
  memberCounts,
  groupColWidth,
}) => (
  <thead className="sticky top-0 z-10 bg-card">
    <tr className="border-b border-border/60 bg-muted/40">
      <th className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground tracking-wide w-48 min-w-[12rem]">
        Feature
      </th>

      {accessGroups.map((group) => {
        const count = memberCounts[group.id] ?? 0;
        return (
          <th key={group.id} className="min-w-[9.5rem]" style={{ width: groupColWidth }}>
            <div className="flex flex-col items-center gap-0.5 px-4 py-2.5">
              <span className="max-w-full truncate text-xs font-semibold text-foreground">
                {group.name}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-2xs",
                  count === 0 ? "text-muted-foreground/40" : "text-muted-foreground/60",
                )}
              >
                <Users className="w-2.5 h-2.5 shrink-0" />
                {count === 0 ? "unused" : count === 1 ? "1 member" : `${count} members`}
              </span>
            </div>
          </th>
        );
      })}
    </tr>
  </thead>
);

export default AccessTableHeader;
