import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cardHover } from '@/lib/animations'
import type { Task, TaskPriority, TaskStatus } from '../types'

interface ChecklistTaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onToggleStatus: (task: Task) => void
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: 'High', className: 'text-destructive border-destructive/30' },
  medium: { label: 'Med', className: 'text-amber-500 border-amber-500/30' },
  low: { label: 'Low', className: 'text-muted-foreground border-border' },
}

const statusIcon: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle className="h-5 w-5 text-muted-foreground" />,
  in_progress: <Clock className="h-5 w-5 text-amber-500" />,
  done: <CheckCircle2 className="h-5 w-5 text-primary" />,
}

export function ChecklistTaskCard({ task, onEdit, onToggleStatus }: ChecklistTaskCardProps) {
  const priority = priorityConfig[task.priority]
  const checklistDone = task.checklist.filter((c) => c.done).length
  const checklistTotal = task.checklist.length

  return (
    <motion.div
      whileHover={cardHover}
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-primary/30 transition-colors"
      onClick={() => onEdit(task)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStatus(task) }}
        className="mt-0.5 shrink-0"
      >
        {statusIcon[task.status]}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="outline" className={`text-[10px] ${priority.className}`}>
            {priority.label}
          </Badge>
          {task.assignees.map((a) => (
            <Badge key={a.roleId} variant="secondary" className="text-[10px] px-1.5 py-0">
              {a.roleShortName}
            </Badge>
          ))}
          {checklistTotal > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {checklistDone}/{checklistTotal}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
