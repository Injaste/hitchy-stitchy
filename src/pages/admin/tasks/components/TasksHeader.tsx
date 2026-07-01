import type { FC } from "react";
import { ArchiveRestore, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base";

import Odometer from "@/components/animations/animate-odometer";
import { useAccess } from "../../hooks/useAccess";
import { useLimitGuard } from "../../plan/hooks/useLimitGuard";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTasksFilter } from "../hooks/useTasksFilter";
import type { Task } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LabelTabs from "./LabelTabs";
import { Separator } from "@/components/ui/separator";
import TasksFilter from "./TasksFilter";

interface TasksHeaderProps extends BaseHeaderProps {
  data?: Task[];
}

const radius = 22;
const circumference = 2 * Math.PI * radius;

const TasksHeader: FC<TasksHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
  data,
}) => {
  const { canCreate, canDelete } = useAccess();
  const openCreate = useTaskModalStore((s) => s.openCreate);
  const guardAdd = useLimitGuard();
  const openArchivedSheet = useTaskModalStore((s) => s.openArchivedSheet);
  const { tabs, activeLabel, setActiveLabel, filteredTasks } = useTasksFilter(
    data ?? [],
  );
  const total = filteredTasks.length;
  const done = filteredTasks.filter((t) => t.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // The control row stays visible whenever there are tasks — even if the
  // current filter matches none — so the filters are always reachable.
  const showControls = !isLoading && !isError && (data?.length ?? 0) > 0;

  return (
    <AdminPageHeader
      title="Tasks"
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      meta={
        showControls && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-row items-center justify-between gap-4 md:gap-6 w-full">
              {/* Progress stat — rounded ring + counts */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative size-11 shrink-0">
                  <svg className="-rotate-90" viewBox="0 0 56 56">
                    <circle
                      cx="28"
                      cy="28"
                      r={radius}
                      fill="none"
                      className="stroke-muted"
                      strokeWidth="5"
                    />
                    <motion.circle
                      cx="28"
                      cy="28"
                      r={radius}
                      fill="none"
                      className="stroke-secondary"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      animate={{
                        strokeDashoffset:
                          circumference * (1 - Math.max(pct, 1) / 100),
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 18,
                      }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xs font-semibold text-foreground">
                    {pct}%
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 text-sm leading-tight text-muted-foreground">
                  <span>
                    <span className="text-foreground font-medium">
                      <Odometer value={done} />
                    </span>{" "}
                    of <Odometer value={total} /> done
                  </span>
                  <span>
                    <span className="text-foreground font-medium">
                      <Odometer value={total - done} />
                    </span>{" "}
                    remaining
                  </span>
                </div>
              </div>

              {/* Labels + assignee filter */}
              <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                <div className="hidden md:block min-w-0 flex-1">
                  {tabs.length >= 2 ? (
                    <LabelTabs
                      labels={tabs}
                      activeLabel={activeLabel}
                      onSelect={setActiveLabel}
                    />
                  ) : null}
                </div>

                <Separator orientation="vertical" className="h-6" />

                <TasksFilter />
              </div>
            </div>

            <div className="block md:hidden min-w-0 flex-1">
              {tabs.length >= 2 ? (
                <LabelTabs
                  labels={tabs}
                  activeLabel={activeLabel}
                  onSelect={setActiveLabel}
                />
              ) : null}
            </div>
          </div>
        )
      }
      action={
        (canCreate("tasks") || canDelete("tasks")) && (
          <div className="flex gap-2">
            {canDelete("tasks") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={openArchivedSheet}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ArchiveRestore className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Archive</p>
                </TooltipContent>
              </Tooltip>
            )}
            {canCreate("tasks") && (
              <Button size="sm" data-tour-action className="gap-0" onClick={() => { if (guardAdd("tasks")) return; openCreate(); }}>
                <Plus className="size-4" /> <ActionLabel>Task</ActionLabel>
              </Button>
            )}
          </div>
        )
      }
    />
  );
};

export default TasksHeader;
