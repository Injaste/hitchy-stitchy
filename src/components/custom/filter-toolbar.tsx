import type { FC, ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FilterToolbarProps {
  /** Left region — a scrollable filter/segment strip. Takes the remaining width. */
  filter?: ReactNode;
  /** Right region — trailing action buttons. */
  actions?: ReactNode;
  className?: string;
}

/**
 * One row that pairs a filter strip with trailing actions, split by a vertical
 * divider — the tasks header layout (labels • assignee filter). The filter takes
 * the remaining width (so its rail scrolls); the actions stay put on the right.
 * With no filter, the actions simply right-align and the divider is dropped.
 */
const FilterToolbar: FC<FilterToolbarProps> = ({
  filter,
  actions,
  className,
}) => (
  <div className={cn("mb-5 flex min-w-0 items-center gap-3", className)}>
    {filter && <div className="min-w-0 flex-1">{filter}</div>}
    {filter && actions && (
      <Separator orientation="vertical" className="h-6 shrink-0" />
    )}
    {actions && (
      <div
        className={cn(
          "flex shrink-0 items-center gap-2",
          !filter && "ml-auto",
        )}
      >
        {actions}
      </div>
    )}
  </div>
);

export default FilterToolbar;
