import type { FC } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ComponentFade } from "@/components/animations/animate-component-fade";

import { useAccess } from "../../hooks/useAccess";
import { useRefetch } from "../../hooks/useRefetch";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import type { Task } from "../types";

interface TasksHeaderProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
  data?: Task[];
}

const TasksHeader: FC<TasksHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
  data,
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch);
  const { canCreate } = useAccess();
  const openCreate = useTaskModalStore((s) => s.openCreate);

  const showActions = !isLoading && !isError;
  const total = data?.length ?? 0;
  const done = data?.filter((t) => t.status === "done").length ?? 0;

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs tracking-wide text-muted-foreground/60 font-sans">
        {!isLoading && !isError && total > 0 && (
          <>
            <span>
              {total} {total === 1 ? "task" : "tasks"}
            </span>
            {done > 0 && (
              <>
                <span className="mx-1.5">·</span>
                <span>{done} done</span>
              </>
            )}
          </>
        )}
      </p>

      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key="actions">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground/60 hover:text-muted-foreground"
                onClick={handleRefresh}
                disabled={!canRefresh}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
              {canCreate("tasks") && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={openCreate}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add task
                </Button>
              )}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksHeader;
