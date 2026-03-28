import { TEAM_ROLES } from "@/lib/data";
import type { TeamMember } from "./types";

export async function getUsers(): Promise<TeamMember[]> {
  return TEAM_ROLES;
}

export async function updateAdminStatus(args: {
  role: string;
  isAdmin: boolean;
}): Promise<{ role: string; isAdmin: boolean }> {
  return args;
}
