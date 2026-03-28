export interface ChecklistItem {
  id: string;
  task: string;
  assignees: string[];
  completed: boolean;
  dueDate?: string;
  priority: "High" | "Medium" | "Low";
  day: "Pre-wedding" | "Day 1" | "Day 2";
  notes?: string;
}
