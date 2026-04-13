import type { FC } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Clock, Calendar } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { cardHover } from "@/lib/animations"

import { useTaskModalStore } from "../hooks/useTaskModalStore"
import { useTaskMutations } from "../queries"
import { PRIORITY_LABELS, type Task, type TaskPriority, type TaskStatus } from "../types"

interface TaskCardProps {
  task: Task
}

const statusIcon: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle className="h-5 w-5 text-muted-foreground shrink-0" />,
  in_progress: <Clock className="h-5 w-5 text-amber-500 shrink-0" />,
  done: <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />,
}

const priorityClass: Record<TaskPriority, string> = {
  high: "text-destructive border-destructive/30",
  medium: "text-amber-500 border-amber-500/30",
  low: "text-muted-foreground border-border",
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

  return (
    <motion.div
      whileHover={cardHover}
      className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 cursor-pointer hover:border-primary/30 transition-colors"
      onClick={() => openDetail(task)}
    >
      <button
        onClick={handleToggle}
        className="mt-0.5"
        aria-label="Toggle status"
      >
        {statusIcon[task.status]}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.priority && (
            <Badge variant="outline" className={`text-[10px] ${priorityClass[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          )}
          {task.due_at && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_at), "d MMM")}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard
