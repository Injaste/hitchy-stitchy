/** A current-version plan row from the public `plans_public` view — safe columns
 *  only (no cancelled_grace_pct, no stripe SKU). Drives the upgrade modal's pitch
 *  + price. UX only; the server is the real boundary. */
export interface PublicPlan {
  key: string;
  tier: string;
  name: string;
  maxDays: number;
  maxSegmentsPerDay: number;
  maxInvitationPages: number;
  maxGuests: number;
  maxMembers: number;
  canUseBudget: boolean;
  canUseGifts: boolean;
  canRemoveBranding: boolean;
  /** Display price in major units (e.g. 49). null until set in Phase E. */
  price: number | null;
}
