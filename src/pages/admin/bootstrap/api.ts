import { supabase } from "@/lib/supabase";
import type { AdminBootstrapContext } from "../types";
import type { PlanTierRow } from "../plan/plan-config";
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
      isOverPlanLimits: plan.is_over_plan_limits ?? false,
      limits: {
        maxDays: limits.max_days,
        maxSegmentsPerDay: limits.max_segments_per_day,
        maxInvitationPages: limits.max_invitation_pages,
        maxGuests: limits.max_guests,
        maxMembers: limits.max_members,
        maxGifts: limits.max_gifts,
        maxExpenses: limits.max_expenses,
        maxTimelineItems: limits.max_timeline_items,
        maxTasks: limits.max_tasks,
      },
      // Feature access straight from the DB map (keyed by feature) — no hand-mapping.
      features: plan.features,
      usage: {
        days: usage.days,
        guests: usage.guests,
        members: usage.members,
        pages: usage.pages,
        timeline_items: usage.timeline_items,
        tasks: usage.tasks,
      },
    },
    catalog: ((data.catalog ?? []) as Array<{
      tier: string;
      rank: number;
      name: string;
      price: number | null;
      is_free_tier: boolean;
      limits: {
        max_days: number;
        max_segments_per_day: number;
        max_invitation_pages: number;
        max_guests: number;
        max_members: number;
        max_gifts: number;
        max_expenses: number;
        max_timeline_items: number;
        max_tasks: number;
      };
      features: Record<string, boolean>;
    }>).map((c) => ({
      tier: c.tier,
      rank: c.rank,
      name: c.name,
      price: c.price,
      isFreeTier: c.is_free_tier,
      // Convert snake_case caps → camelCase (same shape as plan.limits) so the
      // upgrade diff + near-limit checks read the same keys everywhere.
      limits: {
        maxDays: c.limits.max_days,
        maxSegmentsPerDay: c.limits.max_segments_per_day,
        maxInvitationPages: c.limits.max_invitation_pages,
        maxGuests: c.limits.max_guests,
        maxMembers: c.limits.max_members,
        maxGifts: c.limits.max_gifts,
        maxExpenses: c.limits.max_expenses,
        maxTimelineItems: c.limits.max_timeline_items,
        maxTasks: c.limits.max_tasks,
      },
      features: c.features as PlanTierRow["features"],
    })),
  };
}
