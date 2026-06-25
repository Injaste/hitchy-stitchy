import { createDisclosureStore } from "../../hooks/modalStoreFactories";

/** Singleton open-state for the bespoke-request modal — triggered from the hub promo card, mounted in InvitationHub. */
export const useBespokeModalStore = createDisclosureStore();
