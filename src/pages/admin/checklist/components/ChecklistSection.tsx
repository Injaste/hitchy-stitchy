import { motion } from 'framer-motion'
import { container, itemFadeUp } from '@/lib/animations'
import type { Task } from '../types'
import { ChecklistTaskCard } from './ChecklistTaskCard'

interface ChecklistSectionProps {
  label: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onToggleStatus: (task: Task) => void
}

export function ChecklistSection({ label, tasks, onEdit, onToggleStatus }: ChecklistSectionProps) {
  if (!tasks.length) return null

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label} ({tasks.length})
      </h3>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2"
      >
        {tasks.map((task) => (
          <motion.div key={task.id} variants={itemFadeUp}>
            <ChecklistTaskCard
              task={task}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
