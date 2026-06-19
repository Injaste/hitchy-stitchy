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
  const plan = data.plan;
  const limits = plan.limits;
  const usage = plan.usage;

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
    plan: {
      key: plan.key,
      tier: plan.tier,
      name: plan.name,
      activatedAt: plan.activated_at ?? null,
      isOver: plan.is_over ?? false,
      limits: {
        maxDays: limits.max_days,
        maxSegmentsPerDay: limits.max_segments_per_day,
        maxInvitationPages: limits.max_invitation_pages,
        maxGuests: limits.max_guests,
        maxMembers: limits.max_members,
        canUseBudget: limits.can_use_budget,
        canUseGifts: limits.can_use_gifts,
        canRemoveBranding: limits.can_remove_branding,
      },
      usage: {
        days: usage.days,
        guests: usage.guests,
        members: usage.members,
        pages: usage.pages,
      },
    },
  };
}
