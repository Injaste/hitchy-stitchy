export interface ChecklistItem {
  id: string;
  task: string;
  assignees: string[];
  completed: boolean;
  dueDate?: string;
  priority: "High" | "Medium" | "Low";
  day: string;
  notes?: string;
}
