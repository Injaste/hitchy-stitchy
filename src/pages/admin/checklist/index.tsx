import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminStore } from "../store/useAdminStore";
import { useChecklistQuery, useUpdateTaskMutation } from "./queries";
import type { Task, TaskStatus } from "./types";

import { ChecklistSection } from "./components/ChecklistSection";
import { TaskModal } from "./components/modals/TaskModal";
import { ConfirmDeleteTaskModal } from "./components/modals/ConfirmDeleteTaskModal";

const STATUS_ORDER: TaskStatus[] = ["in_progress", "todo", "done"];

export function ChecklistTab() {
  const { data: tasks, isLoading } = useChecklistQuery();
  const { mutate: updateTask } = useUpdateTaskMutation();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const handleToggleStatus = (task: Task) => {
    const nextStatus: TaskStatus = task.status === "done" ? "todo" : "done";
    updateTask({
      ...task,
      status: nextStatus,
      completedAt: nextStatus === "done" ? new Date().toISOString() : undefined,
    });
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <ComponentFade key="skeleton">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </ComponentFade>
        ) : !tasks?.length ? (
          <ComponentFade key="empty">
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tap the + button to add one.
              </p>
            </div>
          </ComponentFade>
        ) : (
          <ComponentFade key="content">
            <div className="space-y-6"></div>
          </ComponentFade>
        )}
      </AnimatePresence>

      <TaskModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        task={editingTask}
      />
      <ConfirmDeleteTaskModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        task={deleteTarget}
      />
    </>
  );
}
