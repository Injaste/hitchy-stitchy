import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import type { Task } from "../types";

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
  const { canCreate } = useAccess();
  const openCreate = useTaskModalStore((s) => s.openCreate);
  const total = data?.length ?? 0;
  const done = data?.filter((t) => t.status === "done").length ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const circumference = 2 * Math.PI * 19; // r=19

  return (
    <PageHeader
      description="Assign, track, and manage to-dos across your team. Stay on top of what needs to get done before the big day."
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
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
                  r="22"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="5"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  className="stroke-secondary"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct / 100)}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xs font-semibold">
                {pct}%
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
              <span>
                <span className="text-foreground font-medium">{done}</span> of{" "}
                {total} tasks done
              </span>
              <span>
                <span className="text-foreground font-medium">
                  {total - done}
                </span>{" "}
                remaining
              </span>
            </div>
          </div>
        )
      }
      action={
        canCreate("tasks") && (
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add task
          </Button>
        )
      }
    />
  );
};

export default TasksHeader;
