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
import ArraySeparator from "@/components/custom/array-separator";

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
          <ArraySeparator
            items={[
              `${total} ${total === 1 ? "task" : "tasks"}`,
              done > 0 && `${done} done`,
            ]}
          />
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
