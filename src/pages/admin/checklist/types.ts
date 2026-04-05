export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface TaskAssignee {
  roleId: string
  roleName: string
  roleShortName: string
}

export interface Task {
  id: string
  eventId: string
  timelineId?: string
  dayId: string
  title: string
  notes?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  checklist: ChecklistItem[]
  assignees: TaskAssignee[]
  completedAt?: string
  completedByMemberId?: string
  createdAt: string
  updatedAt: string
}
