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

export const priorityVariant: Record<
  ChecklistItem["priority"],
  "default" | "destructive" | "secondary" | "outline"
> = {
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};
