import { supabase } from "@/lib/supabase"
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskOrder } from "./types"

const TASK_FIELDS = "id, event_id, parent_id, created_by, title, details, status, priority, assignees, due_at, start_at, created_at, updated_at"

export async function fetchTasks(eventId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("event_tasks")
    .select(TASK_FIELDS)
    .eq("event_id", eventId)
    .is("parent_id", null)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

export async function fetchTaskOrder(eventId: string): Promise<TaskOrder | null> {
  const { data, error } = await supabase
    .from("event_task_orders")
    .select("event_id, todo, in_progress, done")
    .eq("event_id", eventId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as TaskOrder | null
}

export async function saveTaskOrder(order: TaskOrder): Promise<void> {
  const { error } = await supabase
    .from("event_task_orders")
    .upsert(order, { onConflict: "event_id" })

  if (error) throw new Error(error.message)
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data, error } = await supabase
    .from("event_tasks")
    .insert({
      event_id: payload.event_id,
      title: payload.title,
      details: payload.details,
      priority: payload.priority,
      due_at: payload.due_at,
      assignees: payload.assignees,
    })
    .select(TASK_FIELDS)
    .single()

  if (error) throw new Error(error.message)
  return data as Task
}

export async function updateTask(payload: UpdateTaskPayload): Promise<void> {
  const { id, ...fields } = payload
  const { error } = await supabase
    .from("event_tasks")
    .update(fields)
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from("event_tasks")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}
