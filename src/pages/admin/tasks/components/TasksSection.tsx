import type { FC } from "react"
import { motion } from "framer-motion"

import { container, itemFadeUp } from "@/lib/animations"

import type { Task } from "../types"
import TaskCard from "./TaskCard"

interface TasksSectionProps {
  label: string
  tasks: Task[]
}

const TasksSection: FC<TasksSectionProps> = ({ label, tasks }) => {
  if (!tasks.length) return null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-baseline">
          <span className="text-sm font-display font-medium text-foreground/70">
            {label}
          </span>
          <span className="ml-2 text-xs text-muted-foreground tabular-nums">
            {tasks.length}
          </span>
        </div>
        <div className="h-px bg-border/50" />
      </div>

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
    </div>
  )
}

export default TasksSection
