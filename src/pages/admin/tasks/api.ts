import { supabase } from "@/lib/supabase";
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskOrder,
} from "./types";

const TASK_FIELDS =
  "id, event_id, parent_id, created_by, title, details, status, priority, assignees, due_at, start_at, created_at, updated_at";

export async function fetchTasks(eventId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("event_tasks")
    .select(TASK_FIELDS)
    .eq("event_id", eventId)
    .is("parent_id", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function fetchTaskOrder(
  eventId: string,
): Promise<TaskOrder | null> {
  const { data, error } = await supabase
    .from("event_settings")
    .select("task_order")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return { event_id: eventId, ...data.task_order } as TaskOrder;
}

export async function saveTaskOrder(order: TaskOrder): Promise<void> {
  const { event_id, ...task_order } = order;
  console.log(order);

  const { error } = await supabase.rpc("update_task_order", {
    p_event_id: event_id,
    p_task_order: task_order,
  });

  if (error) throw new Error(error.message);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data, error } = await supabase.rpc("create_task", {
    p_event_id: payload.event_id,
    p_title: payload.title,
    p_details: payload.details,
    p_priority: payload.priority,
    p_due_at: payload.due_at,
    p_assignees: payload.assignees,
  });

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(payload: UpdateTaskPayload): Promise<void> {
  const { error } = await supabase.rpc("update_task", {
    p_id: payload.id,
    p_title: payload.title,
    p_details: payload.details,
    p_priority: payload.priority,
    p_due_at: payload.due_at,
    p_assignees: payload.assignees,
    p_status: payload.status,
  });

  if (error) throw new Error(error.message);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_task", { p_id: id });

  if (error) throw new Error(error.message);
}
