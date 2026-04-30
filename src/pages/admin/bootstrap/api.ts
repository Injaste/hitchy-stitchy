import { supabase } from "@/lib/supabase";
import type { AdminBootstrapContext } from "../types";
import { isAdminMember } from "./utils";

export async function fetchBootstrapContext(
  slug: string,
): Promise<AdminBootstrapContext> {
  const { data, error } = await supabase.rpc("get_bootstrap_context", {
    p_slug: slug,
  });

  if (error) throw new Error(error.message);
  if (!data?.length)
    throw new Error("You are not an active member of this event");

  const row = data[0];

  return {
    slug: row.slug,
    eventId: row.event_id,
    eventName: row.event_name,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    memberId: row.member_id,
    memberDisplayName: row.member_display_name,
    memberRoleId: row.member_role_id,
    memberRoleName: row.member_role_name,
    memberRoleShortName: row.member_role_short_name,
    memberRoleCategory: row.member_role_category,
    isAdmin: isAdminMember(row.member_role_category),
  };
}
