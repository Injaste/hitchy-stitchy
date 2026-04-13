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
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label} <span className="opacity-60">({tasks.length})</span>
      </h3>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2"
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
