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
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-medium text-muted-foreground/50 tracking-widest uppercase shrink-0 font-sans">
          {label}
        </span>
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[11px] text-muted-foreground/40 tabular-nums shrink-0">
          {tasks.length}
        </span>
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
