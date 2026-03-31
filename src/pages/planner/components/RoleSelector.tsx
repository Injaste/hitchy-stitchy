import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAssigneeDisplay } from "@/pages/planner/utils/assigneeDisplay";
import { useAdminStore } from "@/pages/planner/store/useAdminStore";

export function RoleSelector() {
  const { teamRoles, currentRole, setCurrentRole } = useAdminStore();

  return (
    <Select value={currentRole} onValueChange={setCurrentRole}>
      <SelectTrigger size="sm" className="text-xs w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {teamRoles.map((r) => (
          <SelectItem key={r.role} value={r.role}>
            {getAssigneeDisplay(r.role, teamRoles)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
