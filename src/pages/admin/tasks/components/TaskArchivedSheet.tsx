import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { container, itemFadeUp } from "@/lib/animations";

import { useArchivedTasksQuery, useTaskMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useAccess } from "../../hooks/useAccess";
import { useTaskModalStore } from "../hooks/useTaskModalStore";
import { PRIORITY_LABELS, PRIORITY_BADGE_CLASS, type Task } from "../types";

const TaskArchivedSheet = () => {
  const open = useTaskModalStore((s) => s.isArchivedSheetOpen);
  const closeArchivedSheet = useTaskModalStore((s) => s.closeArchivedSheet);
  const { eventId } = useAdminStore();
  const { canDelete } = useAccess();
  const { data, isLoading } = useArchivedTasksQuery();
  const { archive } = useTaskMutations();

  const onOpenChange = (next: boolean) => {
    if (!next) closeArchivedSheet();
  };

  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleUnarchive = async (task: Task) => {
    setPendingId(task.id);
    try {
      await archive.mutateAsync({
        event_id: eventId!,
        ids: [task.id],
        archive: false,
        label: task.title,
      });
      // On success the row exits — AnimatePresence freezes its last render,
      // so leave pendingId set; it becomes dead state for an ID no row matches.
    } catch {
      // Toast handled by mutation wrapper; clear so the row reverts to "Unarchive".
      setPendingId(null);
    }
  };

  const handleDelete = (task: Task) => {
    useTaskModalStore.setState({ selectedItem: task, isDeleteOpen: true });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="gap-0">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <Archive className="size-4 text-muted-foreground" />
            Archived tasks
          </SheetTitle>
          <SheetDescription>
            Restore any task back to its column, or leave it tucked away.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </motion.div>
            ) : !data || data.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground text-center py-12 italic"
              >
                No archived tasks yet.
              </motion.p>
            ) : (
              <motion.div
                key="list"
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                <AnimatePresence>
                  {data.map((task) => (
                    <motion.div
                      key={task.id}
                      variants={itemFadeUp}
                      exit="hidden"
                      layout
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-sm font-medium text-foreground/80 line-through truncate max-w-[18rem]">
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Archive className="size-4 text-muted-foreground" />
                            {format(parseISO(task.archived_at), "d MMM yyyy")}
                          </span>
                          {task.priority && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium font-sans tracking-wide",
                                PRIORITY_BADGE_CLASS[task.priority],
                              )}
                            >
                              {PRIORITY_LABELS[task.priority]}
                            </span>
                          )}
                        </div>
                      </div>

                      {canDelete("tasks") && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnarchive(task)}
                            disabled={pendingId === task.id}
                            className="gap-1.5"
                          >
                            <RotateCcw className="size-3.5" />
                            {pendingId === task.id ? "Restoring…" : "Unarchive"}
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            onClick={() => handleDelete(task)}
                            disabled={pendingId === task.id}
                            aria-label="Delete task"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskArchivedSheet;
