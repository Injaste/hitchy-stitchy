import { checklists } from "@/lib/data";
import type { ChecklistItem } from "./types";

export async function getTasks(): Promise<ChecklistItem[]> {
  return checklists;
}

export async function createTask(task: Omit<ChecklistItem, "id">): Promise<ChecklistItem> {
  return { ...task, id: `tsk-${Date.now()}` };
}

export async function updateTask(task: ChecklistItem): Promise<ChecklistItem> {
  return task;
}

export async function deleteTask(id: string): Promise<string> {
  return id;
}
