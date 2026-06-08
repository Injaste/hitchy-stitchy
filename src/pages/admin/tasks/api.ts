import { supabase } from "@/lib/supabase";
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  DeleteTaskPayload,
  ArchiveTasksPayload,
  MoveTaskPayload,
} from "./types";

const TASK_FIELDS =
  "id, event_id, created_by, title, details, label, status, priority, assignees, due_at, completed_at, created_at, updated_at, archived_at";

export async function fetchTasks(eventId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("event_tasks")
    .select(`${TASK_FIELDS}, position`)
    .eq("event_id", eventId)
    .is("archived_at", null)
    .order("status", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function fetchArchivedTasks(eventId: string): Promise<Task[]> {
  // The event_tasks_archived view predates `position` and doesn't expose it;
  // the archived sheet sorts by updated_at and never reads position.
  const { data, error } = await supabase
    .from("event_tasks_archived")
    .select(TASK_FIELDS)
    .eq("event_id", eventId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data, error } = await supabase.rpc("create_task", {
    p_event_id: payload.event_id,
    p_title: payload.title,
    p_details: payload.details,
    p_priority: payload.priority,
    p_due_at: payload.due_at,
    p_assignees: payload.assignees,
    p_label: payload.label ?? null,
    p_status: payload.status,
  });

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(payload: UpdateTaskPayload): Promise<Task> {
  const { data, error } = await supabase.rpc("update_task", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_title: payload.title,
    p_details: payload.details,
    p_priority: payload.priority,
    p_due_at: payload.due_at,
    p_assignees: payload.assignees,
    p_status: payload.status,
    p_label: payload.label ?? null,
  });

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function moveTask(payload: MoveTaskPayload): Promise<Task> {
  const { data, error } = await supabase.rpc("move_task", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_status: payload.status,
    p_position: payload.position,
  });

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function deleteTask(payload: DeleteTaskPayload): Promise<void> {
  const { error } = await supabase.rpc("delete_task", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  });

  if (error) throw new Error(error.message);
}

export async function archiveTasks(payload: ArchiveTasksPayload): Promise<void> {
  const { error } = await supabase.rpc("archive_tasks", {
    p_event_id: payload.event_id,
    p_ids: payload.ids,
    p_archive: payload.archive,
  });

  if (error) throw new Error(error.message);
}
