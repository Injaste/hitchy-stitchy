import type { FC } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { container, itemFadeUp } from "@/lib/animations"

import type { Task } from "../types"
import TaskCard from "./TaskCard"

interface TasksSectionProps {
  label: string
  tasks: Task[]
}

const TasksSection: FC<TasksSectionProps> = ({ label, tasks }) => {
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
              <TaskCard task={task} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default TasksSection
