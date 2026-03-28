import { CheckSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fadeIn } from "@/pages/admin/animations";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { ChecklistItem } from "./ChecklistItem";
import type { ChecklistItem as ChecklistItemType } from "./types";

interface Props {
  title: string;
  tasks: ChecklistItemType[];
  onToggle: (id: string) => void;
}

export function ChecklistSection({ title, tasks, onToggle }: Props) {
  const { currentRole, teamRoles } = useAdminStore();
  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  const visible = tasks.filter((t) => {
    if (isAdmin) return true;
    return (
      t.assignees.includes(currentRole) ||
      currentUser?.names.some((n) => t.assignees.includes(n)) ||
      t.assignees.includes("All")
    );
  });

  if (tasks.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-base md:text-lg font-serif font-semibold text-primary mb-3 md:mb-4">
          {title}
        </h3>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn(0)}
          className="flex flex-col items-center justify-center py-12 gap-3 text-center"
        >
          <CheckSquare className="h-10 w-10 text-muted-foreground opacity-30" />
          <p className="font-semibold text-foreground">All clear</p>
          <p className="text-sm text-muted-foreground">No tasks in this section.</p>
        </motion.div>
      </div>
    );
  }

  if (visible.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-base md:text-lg font-serif font-semibold text-primary mb-3 md:mb-4">
        {title}
      </h3>
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {visible.map((task, i) => (
              <div key={task.id}>
                <ChecklistItem task={task} index={i} onToggle={onToggle} />
                {i < visible.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
