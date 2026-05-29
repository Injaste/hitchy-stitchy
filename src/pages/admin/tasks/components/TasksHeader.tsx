import type { FC } from "react";
import { ArchiveRestore, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import { ActionLabel, type BaseHeaderProps } from "@/components/custom/page-header-base";

import Odometer from "@/components/animations/animate-odometer";
import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTasksFilter } from "../hooks/useTasksFilter";
import type { Task } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TasksHeaderProps extends BaseHeaderProps {
  data?: Task[];
}

const TasksHeader: FC<TasksHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
  data,
}) => {
  const { canCreate, canDelete } = useAccess();
  const openCreate = useTaskModalStore((s) => s.openCreate);
  const openArchivedSheet = useTaskModalStore((s) => s.openArchivedSheet);
  const isDragging = useTaskModalStore((s) => s.isDragging);
  const { filteredTasks } = useTasksFilter(data ?? []);
  const total = filteredTasks.length;
  const done = filteredTasks.filter((t) => t.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  return (
    <AdminPageHeader
      title="Tasks"
      description="Assign, track, and manage to-dos across your team. Stay on top of what needs to get done before the big day."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      collapseMeta={!isDragging}
      lockOpen={isDragging}
      meta={
        !isLoading &&
        !isError &&
        total > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative size-[50px] shrink-0">
              <svg
                className="-rotate-90"
                width="48"
                height="48"
                viewBox="0 0 56 56"
              >
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
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xs font-semibold">
                {pct}%
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
              <span>
                <span className="text-foreground font-medium">
                  <Odometer value={done} />
                </span>{" "}
                of <Odometer value={total} /> tasks done
              </span>
              <span>
                <span className="text-foreground font-medium">
                  <Odometer value={total - done} />
                </span>{" "}
                remaining
              </span>
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
              <Button size="sm" className="gap-0" onClick={openCreate}>
                <Plus className="size-4" />{" "}
                <ActionLabel lockOpen={isDragging}>Task</ActionLabel>
              </Button>
            )}
          </div>
        )
      }
    />
  );
};

export default TasksHeader;
