import { createCrudModalStore } from "../../hooks/modalStoreFactories"
import type { Vendor } from "../types"

// Nothing to extend — the card opens detail, and detail hands off to edit/delete
// through the factory's own actions (same as useMemberModalStore).
export const useVendorModalStore = createCrudModalStore<Vendor>()
