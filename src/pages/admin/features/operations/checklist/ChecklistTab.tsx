import { ListTodo } from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { ChecklistSection } from "./ChecklistSection";

export function ChecklistTab() {
  const { tasks, setTasks, currentRole, teamRoles, addLog, eventConfig } =
    useAdminStore();

  const sections = ["Pre-wedding", ...eventConfig.days.map((d) => d.label)];
  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  const shouldNotify = (assignees: string[]) => {
    if (isAdmin) return true;
    if (assignees.includes("All")) return true;
    if (assignees.includes(currentRole)) return true;
    if (currentUser?.names.some((n) => assignees.includes(n))) return true;
    return false;
  };

  const handleToggle = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== id) return t;
        const isCompleted = !t.completed;
        addLog(
          currentRole,
          isCompleted
            ? `Completed task: ${t.task}`
            : `Unchecked task: ${t.task}`,
        );
        if (shouldNotify(t.assignees)) {
          if (isCompleted) toast.success(`Task completed: ${t.task}`);
          else toast(`Task unchecked: ${t.task}`, { icon: "⏳" });
        }
        return { ...t, completed: isCompleted };
      }),
    );
  };

  return (
    <div className="pb-24">
      <div className="mb-6 flex items-center gap-3">
        <ListTodo className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        <h2 className="text-xl md:text-2xl font-serif font-semibold text-primary">
          To-Do List
        </h2>
      </div>
      {sections.map((section) => (
        <ChecklistSection
          key={section}
          title={section}
          tasks={tasks.filter((t) => t.day === section)}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
