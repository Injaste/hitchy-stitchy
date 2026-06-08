import type { FC } from "react";
import { Plus, ListTodo } from "lucide-react";

import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/states/empty-state";

interface TasksEmptyProps {
  onAdd: () => void;
  canCreate: boolean;
}

const TasksEmpty: FC<TasksEmptyProps> = ({ onAdd, canCreate }) => (
  <EmptyState
    icon={
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-dashed border-primary/20 flex items-center justify-center">
        <ListTodo className="w-7 h-7 text-primary" />
      </div>
    }
    title="Nothing on the list yet"
    description="Add your first task to keep everything in one place — from florals to final fittings."
    action={
      canCreate ? (
        <Button onClick={onAdd} className="gap-1">
          <Plus className="w-4 h-4" />
          Add First Task
        </Button>
      ) : undefined
    }
  />
);

export default TasksEmpty;
