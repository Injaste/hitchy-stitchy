import { createDisclosureStore } from "../../hooks/modalStoreFactories";

/** Singleton open-state for the upgrade modal — triggered from AdminTopbar, mounted in AdminView. */
export const useUpgradeModalStore = createDisclosureStore();
