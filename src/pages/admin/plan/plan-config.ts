// Plan display config — labels + tiny ladder helpers (config-as-data). The tier
// ladder and all entitlements come from the DB (bootstrap), never hardcoded here.
import { SUPPORT_EMAIL } from "@/lib/config";

/** Countable resources that get a usage meter. */
export type PlanResource =
  | "guests"
  | "days"
  | "pages"
  | "members"
  | "timeline_items";

/** Display labels for the meters, in the order they should appear. */
export const PLAN_METERS: { resource: PlanResource; label: string }[] = [
  { resource: "guests", label: "Guests" },
  { resource: "days", label: "Event days" },
  { resource: "pages", label: "Invitation pages" },
  { resource: "members", label: "Team members" },
  { resource: "timeline_items", label: "Timeline items" },
];

/** Usage ratio at which the upgrade nudge appears — an early warning before the
 *  hard cap (and only for limits a higher tier actually raises). */
export const NEAR_LIMIT_RATIO = 0.8;

/** Gated feature modules → display label. Keys match the DB `features` map, in
 *  route order (branding is the non-page perk, last). The booleans come from the
 *  DB — this is only labels. Drives RequirePlan + PlanLockedState + the diff.
 *  `timeline_liverun` is a SUB-feature, not a route: the timeline module is open
 *  to every tier, but running the day live (start/end cues) is gated. It rides
 *  this list so it shows in the upgrade diff + powers canUseFeature, but no route
 *  uses RequirePlan on it (it gates an inline control, see TimelineCardView). */
export const PLAN_FEATURES = [
  { key: "timeline", label: "Timeline" },
  { key: "timeline_liverun", label: "Live run" },
  { key: "tasks", label: "Task board" },
  { key: "members", label: "Team management" },
  { key: "access", label: "Access groups" },
  { key: "guests", label: "Guest management" },
  { key: "budget", label: "Budget tracker" },
  { key: "gifts", label: "Gift envelopes" },
  { key: "invitation", label: "Invitation" },
  { key: "branding", label: "Remove branding" },
] as const;

/** A gatable feature key — matches the DB features map exactly. */
export type PlanFeature = (typeof PLAN_FEATURES)[number]["key"];

/** Countable cap keys (the limits fields). */
export type PlanCap =
  | "maxGuests"
  | "maxDays"
  | "maxSegmentsPerDay"
  | "maxInvitationPages"
  | "maxMembers"
  | "maxGifts"
  | "maxExpenses"
  | "maxTimelineItems";

/** Cap → label, in display order. Drives the "higher limits" upgrade diff. */
export const PLAN_CAP_LABELS: { key: PlanCap; label: string }[] = [
  { key: "maxGuests", label: "Guests" },
  { key: "maxDays", label: "Event days" },
  { key: "maxSegmentsPerDay", label: "Segments / day" },
  { key: "maxTimelineItems", label: "Timeline items" },
  { key: "maxInvitationPages", label: "Invitation pages" },
  { key: "maxMembers", label: "Team members" },
  // maxGifts / maxExpenses are intentionally NOT listed: they're flat abuse
  // ceilings (2000, Pro+), not tier levers — budget/gifts already surface as
  // feature UNLOCKS in the modal, so a cap row would be redundant and imply a
  // Pro→Advanced difference that doesn't exist. Enforced server-side only.
];

/** Meter resource → its cap key. Single source for "which cap backs this meter" —
 *  used by the near-limit check (usePlan) and the modal's usage-in-diff row. */
export const CAP_KEY_FOR: Record<PlanResource, PlanCap> = {
  guests: "maxGuests",
  days: "maxDays",
  pages: "maxInvitationPages",
  members: "maxMembers",
  timeline_items: "maxTimelineItems",
};

/** A live tier in the catalog ladder — DB-driven (plans where is_active, ordered
 *  by rank), carrying its caps + features so the client computes the upgrade diff
 *  without a separate fetch. (price is present but not displayed anywhere.) */
export interface PlanTierRow {
  tier: string;
  rank: number;
  name: string;
  price: number | null;
  isFreeTier: boolean;
  limits: Record<PlanCap, number>;
  features: Record<PlanFeature, boolean>;
}

/** Index of a tier in the (rank-ordered) catalog; -1 if it isn't live. */
export const tierIndex = (tier: string, catalog: PlanTierRow[]): number =>
  catalog.findIndex((t) => t.tier === tier);

/** The next tier up the ladder (what checkout sells next), or null at the top /
 *  if the current tier isn't live. */
export const nextTier = (
  tier: string,
  catalog: PlanTierRow[],
): PlanTierRow | null => {
  const i = tierIndex(tier, catalog);
  return i < 0 ? null : (catalog[i + 1] ?? null);
};

/** What a target tier ADDS over the current plan — features it unlocks and caps it
 *  raises (current → target). Always diffed against the live plan, so every tier in
 *  the picker reads as a cumulative "here's what you'd gain". Pure config-as-data:
 *  the modal just renders the result. (`features/limits != null` guards the brief
 *  window where the frontend is live but the catalog-enriching migration isn't.) */
export const diffPlan = (
  target: PlanTierRow,
  currentLimits: Record<PlanCap, number>,
  canUseFeature: (f: PlanFeature) => boolean,
  meter: (r: PlanResource) => { used: number; atLimit: boolean },
) => {
  const unlocked =
    target.features != null
      ? PLAN_FEATURES.filter((f) => target.features[f.key] && !canUseFeature(f.key))
      : [];
  const raised =
    target.limits != null
      ? PLAN_CAP_LABELS.filter((c) => target.limits[c.key] > currentLimits[c.key]).map(
          (c) => {
            // If this cap has a usage meter, show where you stand (45/50 → 500);
            // otherwise just the cap raise (50 → 500).
            const res = PLAN_METERS.find((m) => CAP_KEY_FOR[m.resource] === c.key)
              ?.resource;
            return {
              label: c.label,
              used: res ? meter(res).used : null,
              atLimit: res ? meter(res).atLimit : false,
              from: currentLimits[c.key],
              to: target.limits[c.key],
            };
          },
        )
      : [];
  return { unlocked, raised };
};

/** The single seam for "talk to us about my plan" — used at the top tier, where
 *  there's no higher tier to sell. */
export const planSupportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Hitchy Stitchy — I'd like to increase my plan limits",
)}`;
