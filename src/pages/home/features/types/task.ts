export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  event_id: string;
  created_by: string;
  title: string;
  details: string | null;
  label: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  position: number;
  assignees: string[];
  due_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}
