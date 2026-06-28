import { create } from "zustand";

import type { PlanFeature, PlanResource } from "../plan-config";

/** What prompted the upgrade modal, so it can default to the cheapest tier that
 *  actually relieves THIS trigger — a locked feature, or a cap that's been hit —
 *  instead of blindly defaulting to the next tier up the ladder. Null = a generic
 *  entry point (the banner / billing page), where "next tier" is the right default. */
export type UpgradeTrigger =
  | { kind: "feature"; feature: PlanFeature }
  | { kind: "limit"; resource: PlanResource }
  | null;

interface UpgradeModalState {
  isOpen: boolean;
  trigger: UpgradeTrigger;
  open: (trigger?: UpgradeTrigger) => void;
  close: () => void;
}

/** Singleton open-state for the upgrade modal — triggered from the limit guard,
 *  the locked-feature upsell, the limit banner and the billing page; mounted in
 *  AdminView. Unlike the other modals it carries a trigger (see UpgradeTrigger),
 *  so it can't share the generic createDisclosureStore. */
export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
  isOpen: false,
  trigger: null,
  open: (trigger = null) => set({ isOpen: true, trigger }),
  close: () => set({ isOpen: false }),
}));
