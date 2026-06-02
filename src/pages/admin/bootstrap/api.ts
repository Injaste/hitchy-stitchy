import { supabase } from "@/lib/supabase";
import type { AdminBootstrapContext } from "../types";
import { isSuperAdmin } from "./utils";

export async function fetchBootstrapContext(
  slug: string,
): Promise<AdminBootstrapContext> {
  const { data, error } = await supabase.rpc("get_bootstrap_context", {
    p_slug: slug,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("You are not an active member of this event");

  const member = data.member;
  const accessGroup = data.access_group;

  // TODO they should automatically be false if not explicitly true...
  const isBride = member.is_bride ?? false;
  const isGroom = member.is_groom ?? false;
  const isRoot = member.is_root ?? false;

  return {
    slug: data.slug,
    eventId: data.event_id,
    eventName: data.event_name,
    dateStart: data.date_start,
    dateEnd: data.date_end,
    memberId: member.id,
    memberDisplayName: member.display_name,
    memberAccessGroupId: accessGroup.id,
    memberAccessGroupName: accessGroup.name,
    isRoot,
    isBride,
    isGroom,
    permissions: accessGroup.permissions ?? {},
    memberRole: member.role ?? null,
    isSuperAdmin: isSuperAdmin(isRoot, isBride, isGroom),
  };
}
