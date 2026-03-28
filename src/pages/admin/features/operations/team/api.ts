import { TEAM_ROLES } from "@/lib/data";
import type { TeamMember } from "./types";

export async function getTeamRoles(): Promise<TeamMember[]> {
  return TEAM_ROLES;
}

export async function createRole(role: TeamMember): Promise<TeamMember> {
  return role;
}

export async function updateRole(role: TeamMember): Promise<TeamMember> {
  return role;
}

export async function deleteRole(roleName: string): Promise<string> {
  return roleName;
}
