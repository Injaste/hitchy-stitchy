import { supabase } from "@/lib/supabase";
import type { PublicPlan } from "./types";

/** Fetch a current-version plan from the public catalog view by tier. Returns
 *  null when the tier has no current version. The view exposes only safe,
 *  user-facing columns (the grace pct + Stripe SKU never reach the client). */
export async function fetchPublicPlan(tier: string): Promise<PublicPlan | null> {
  const { data, error } = await supabase
    .from("plans_public")
    .select(
      "key, tier, name, max_days, max_segments_per_day, max_invitation_pages, max_guests, max_members, can_use_budget, can_use_gifts, can_remove_branding, price",
    )
    .eq("tier", tier)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    key: data.key,
    tier: data.tier,
    name: data.name,
    maxDays: data.max_days,
    maxSegmentsPerDay: data.max_segments_per_day,
    maxInvitationPages: data.max_invitation_pages,
    maxGuests: data.max_guests,
    maxMembers: data.max_members,
    canUseBudget: data.can_use_budget,
    canUseGifts: data.can_use_gifts,
    canRemoveBranding: data.can_remove_branding,
    price: data.price,
  };
}
