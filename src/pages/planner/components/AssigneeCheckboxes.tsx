import { Checkbox } from "@/components/ui/checkbox";
import { getAssigneeDisplay } from "@/pages/planner/utils/assigneeDisplay";
import type { TeamMember } from "@/pages/planner/features/operations/team/types";

interface Props {
  teamRoles: TeamMember[];
  defaultAssignees?: string[];
  feature: string;
}

export function AssigneeCheckboxes({
  teamRoles,
  defaultAssignees,
  feature,
}: Props) {
  return (
    <div className="bg-card border border-border rounded-md p-3 max-h-40 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${feature}-assignee-All`}
            name="assignees"
            value="All"
            defaultChecked={defaultAssignees?.includes("All")}
          />
          <label
            htmlFor={`${feature}-assignee-All`}
            className="text-sm cursor-pointer"
          >
            All
          </label>
        </div>
        {teamRoles.map((r) => (
          <div key={r.role} className="flex items-center gap-2">
            <Checkbox
              id={`${feature}-assignee-${r.role}`}
              name="assignees"
              value={r.role}
              defaultChecked={defaultAssignees?.includes(r.role)}
            />
            <label
              htmlFor={`${feature}-assignee-${r.role}`}
              className="text-sm cursor-pointer"
            >
              {getAssigneeDisplay(r.role, teamRoles)}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
