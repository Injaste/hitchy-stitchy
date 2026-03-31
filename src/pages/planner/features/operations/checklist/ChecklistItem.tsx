import { motion } from "framer-motion";
import { Bell, Calendar, Flag, StickyNote, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/pages/planner/animations";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";
import { useModalStore } from "@/pages/planner/store/useModalStore";
import { getAssigneeDisplay } from "@/pages/planner/utils/assigneeDisplay";
import {
  type ChecklistItem as ChecklistItemType,
  priorityVariant,
} from "./types";

interface Props {
  task: ChecklistItemType;
  index: number;
  onToggle: (id: string) => void;
}

export function ChecklistItem({ task, index, onToggle }: Props) {
  const { teamRoles } = useAdminStore();
  const { openTaskModal, openPingModal } = useModalStore();

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp(index * 0.04)}
      onClick={() => openTaskModal(task)}
      className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4 p-3 md:p-4",
        "transition-colors hover:bg-muted/50 relative group cursor-pointer",
        task.completed ? "opacity-60" : "",
      )}
    >
      <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
        >
          <Checkbox id={task.id} checked={task.completed} className="mt-1" />
        </div>
        <div className="flex-1 space-y-1.5 pr-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
            <label
              htmlFor={task.id}
              onClick={(e) => e.preventDefault()}
              className={cn(
                "text-sm md:text-base font-medium leading-tight cursor-pointer",
                task.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {task.task}
            </label>
            <Badge
              variant={priorityVariant[task.priority]}
              className="w-fit text-[10px] gap-0.5"
            >
              <Flag className="w-2.5 h-2.5" />
              {task.priority}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {task.assignees.map((role) => (
              <button
                key={role}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openPingModal(role);
                }}
                className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border text-[10px] md:text-xs font-medium hover:bg-muted/80 transition-colors"
              >
                <User className="h-3 w-3" />
                {getAssigneeDisplay(role, teamRoles)}
                <Bell className="w-3 h-3" />
              </button>
            ))}
            {task.dueDate && (
              <div className="flex items-center gap-1 bg-primary/5 text-primary px-2 py-0.5 rounded-md border border-primary/10 text-[10px] md:text-xs font-medium">
                <Calendar className="h-3 w-3" />
                {task.dueDate}
              </div>
            )}
          </div>
          {task.notes && (
            <div className="mt-2 text-xs bg-muted p-2.5 rounded-md text-muted-foreground border border-border flex gap-2 items-start">
              <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{task.notes}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
