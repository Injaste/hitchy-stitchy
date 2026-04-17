import type { FC } from "react"
import { motion } from "framer-motion"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"
import { container, itemFadeUp } from "@/lib/animations"

import type { Task } from "../types"
import DraggableTaskCard from "./DraggableTaskCard"

interface TasksSectionProps {
  status: string
  label: string
  tasks: Task[]
  isDragTarget?: boolean
}

const TasksSection: FC<TasksSectionProps> = ({ status, label, tasks, isDragTarget }) => {
  const { setNodeRef } = useDroppable({ id: status })
  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      className={cn(
        "flex flex-col gap-4 min-w-0 lg:min-w-[280px] lg:flex-1",
        tasks.length === 0 && "hidden lg:flex",
      )}
    >
      <div className="space-y-2">
        <div className="flex items-baseline">
          <span className="text-sm font-display font-medium text-foreground/70">
            {label}
          </span>
          {tasks.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground tabular-nums">
              {tasks.length}
            </span>
          )}
        </div>
        <div className="h-px bg-border/50" />
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-3 min-h-[60px] rounded-xl transition-colors duration-150",
            isDragTarget && "ring-1 ring-primary/30 bg-primary/[0.03] p-2",
          )}
        >
          {tasks.length === 0 ? (
            <div className="hidden lg:flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-border/40">
              <p className="text-xs text-muted-foreground/50 text-center">No tasks yet</p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3"
            >
              {tasks.map((task) => (
                <motion.div key={task.id} variants={itemFadeUp}>
                  <DraggableTaskCard task={task} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default TasksSection
