import type { TeamMember } from "@/pages/admin/team/types";

export function getAssigneeDisplay(roleName: string, teamRoles: TeamMember[]): string {
  if (roleName === "All") return "All";
  return roleName;
}
