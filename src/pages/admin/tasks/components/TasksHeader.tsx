import type { FC } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

import OdometerDigit from "@/components/animations/animate-odometer-digit";
import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { useTaskLabelFilter } from "../hooks/useTaskLabelFilter";
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
  const { filteredTasks } = useTaskLabelFilter(data ?? []);
  const total = filteredTasks.length;
  const done = filteredTasks.filter((t) => t.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;

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
                <span className="inline-flex items-center text-foreground font-medium">
                  {String(done)
                    .split("")
                    .map((d, i) => (
                      <OdometerDigit key={i} value={Number(d)} />
                    ))}
                </span>{" "}
                of{" "}
                <span className="inline-flex items-center">
                  {String(total)
                    .split("")
                    .map((d, i) => (
                      <OdometerDigit key={i} value={Number(d)} />
                    ))}
                </span>{" "}
                tasks done
              </span>
              <span>
                <span className="inline-flex items-center text-foreground font-medium">
                  {String(total - done)
                    .split("")
                    .map((d, i) => (
                      <OdometerDigit key={i} value={Number(d)} />
                    ))}
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
