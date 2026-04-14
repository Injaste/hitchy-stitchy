import type { FC, ReactNode } from "react"
import { motion } from "framer-motion"
import { Check, Calendar } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { cardHover } from "@/lib/animations"
import { parseLocalDate } from "@/lib/utils/utils-time"

import { useTaskModalStore } from "../hooks/useTaskModalStore"
import { useTaskMutations } from "../queries"
import type { Task, TaskPriority, TaskStatus } from "../types"

interface TaskCardProps {
  task: Task
}

const priorityAccent: Record<TaskPriority, string> = {
  high: "bg-destructive",
  medium: "bg-primary",
  low: "bg-secondary",
}

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
}

const TaskCard: FC<TaskCardProps> = ({ task }) => {
  const openDetail = useTaskModalStore((s) => s.openDetail)
  const { update } = useTaskMutations()

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    update.mutate({ id: task.id, status: nextStatus[task.status] })
  }

  const isDone = task.status === "done"

  let statusEl: ReactNode
  if (task.status === "done") {
    statusEl = (
      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-primary" strokeWidth={2.5} />
      </div>
    )
  } else if (task.status === "in_progress") {
    statusEl = (
      <div className="w-5 h-5 rounded-full ring-1 ring-primary/50 bg-primary/10 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary/60" />
      </div>
    )
  } else {
    statusEl = (
      <div className="w-5 h-5 rounded-full ring-1 ring-muted-foreground/25 shrink-0" />
    )
  }

  return (
    <motion.div
      whileHover={cardHover}
      onClick={() => openDetail(task)}
      className="relative bg-card rounded-xl ring-1 ring-foreground/8 px-5 py-4 cursor-pointer transition-shadow hover:shadow-sm overflow-hidden"
    >
      {task.priority && (
        <div className={cn("absolute left-0 inset-y-0 w-[3px]", priorityAccent[task.priority])} />
      )}

      <div className={cn("flex items-start gap-4", isDone && "opacity-55")}>
        <button
          onClick={handleToggle}
          className="shrink-0 mt-0.5"
          aria-label="Toggle task status"
        >
          {statusEl}
        </button>

        <div className="flex-1 space-y-1.5">
          <p
            className={cn(
              "font-display text-sm font-medium leading-snug",
              isDone ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {task.title}
          </p>

          {task.due_at && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60 font-sans">
              <Calendar className="w-3 h-3" />
              {format(parseLocalDate(task.due_at), "d MMM yyyy")}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard
