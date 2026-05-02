import { z } from "zod";

export const ALL_LABEL = "All";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  event_id: string;
  parent_id: string | null;
  created_by: string;
  title: string;
  details: string | null;
  label: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  assignees: string[]; // event_members.id[]
  due_at: string | null; // "yyyy-MM-dd"
  created_at: string;
  updated_at: string;
}

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  details: z
    .string()
    .max(2000, "Details is too long")
    .transform((v) => v || null),
  label: z
    .string()
    .max(100, "Please keep label short")
    .superRefine((v, ctx) => {
      if (v.trim().toLowerCase() === ALL_LABEL.toLowerCase()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `'${ALL_LABEL}' is reserved — pick a different label.`,
        });
      }
    })
    .transform((v) => v.trim() || null),
  priority: z.enum(["low", "medium", "high"]).nullable(),
  due_at: z.string().nullable(),
  assignees: z.array(z.string()),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export interface CreateTaskPayload {
  event_id: string;
  title: string;
  details: string | null;
  label: string | null;
  priority: TaskPriority | null;
  due_at: string | null;
  assignees: string[];
}

export interface UpdateTaskPayload {
  id: string;
  title: string;
  details: string | null;
  label: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  due_at: string | null;
  assignees: string[];
}


export const STATUS_ORDER_MOBILE: TaskStatus[] = [
  "in_progress",
  "todo",
  "done",
];
export const STATUS_ORDER_DESKTOP: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  in_progress: "In progress",
  todo: "To do",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  high: "bg-destructive/10 text-destructive ring-1 ring-destructive/25",
  medium: "bg-warning/10 text-warning ring-1 ring-warning/30",
  low: "bg-secondary/15 text-secondary ring-1 ring-secondary/30",
};

export interface TaskOrder {
  event_id: string;
  todo: string[];
  in_progress: string[];
  done: string[];
}
