import type { TeamMember } from "@/pages/admin/team/types";

export function getAssigneeDisplay(roleName: string, teamRoles: TeamMember[]): string {
  if (roleName === "All") return "All";
  const role = teamRoles.find((r) => r.role === roleName);
  if (role) return `${role.shortRole} – ${role.names.join(" & ")}`;
  return roleName;
}
