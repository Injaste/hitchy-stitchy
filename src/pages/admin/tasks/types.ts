import { z } from "zod"

export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  event_id: string
  parent_id: string | null
  created_by: string
  title: string
  details: string | null
  status: TaskStatus
  priority: TaskPriority | null
  assignees: string[]        // event_members.id[]
  due_at: string | null      // "yyyy-MM-dd"
  start_at: string | null    // "yyyy-MM-dd"
  created_at: string
  updated_at: string
}

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  details: z.string().max(2000, "Details is too long").transform((v) => v || null),
  priority: z.enum(["low", "medium", "high"]).nullable(),
  due_at: z.string().nullable(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export interface CreateTaskPayload {
  event_id: string
  title: string
  details: string | null
  priority: TaskPriority | null
  due_at: string | null
}

export interface UpdateTaskPayload {
  id: string
  title?: string
  details?: string | null
  status?: TaskStatus
  priority?: TaskPriority | null
  due_at?: string | null
}

export const STATUS_ORDER: TaskStatus[] = ["in_progress", "todo", "done"]

export const STATUS_LABELS: Record<TaskStatus, string> = {
  in_progress: "In progress",
  todo: "To do",
  done: "Done",
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}
