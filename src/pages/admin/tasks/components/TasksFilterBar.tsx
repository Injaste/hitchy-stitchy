import type { FC } from "react";

import { Separator } from "@/components/ui/separator";
import LabelTabs from "./LabelTabs";
import TasksFilter from "./TasksFilter";

interface TasksFilterBarProps {
  tabs: string[];
  activeLabel: string;
  onSelect: (label: string) => void;
}

/**
 * Filter row above the board — label tabs on the left, priority +
 * assignee filter popover on the right. Spacing comes from the parent
 * grid's `gap-6`; this component owns only its own layout.
 */
const TasksFilterBar: FC<TasksFilterBarProps> = ({
  tabs,
  activeLabel,
  onSelect,
}) => (
  <div className="flex items-center gap-3">
    <div className="min-w-0 flex-1">
      {tabs.length >= 2 ? (
        <LabelTabs labels={tabs} activeLabel={activeLabel} onSelect={onSelect} />
      ) : null}
    </div>
    {tabs.length >= 2 && (
      <Separator orientation="vertical" className="h-6" />
    )}
    <TasksFilter />
  </div>
);

export default TasksFilterBar;
