import { createCrudModalStore } from "../../hooks/modalStoreFactories"
import type { Vendor } from "../types"

// Nothing to extend — the card opens detail, and detail hands off to edit/delete
// through the factory's own actions (same as useMemberModalStore). The hand-off
// to the budget expense modals returns here via their onCloseReturn callback,
// so no return state is needed on this side either.
export const useVendorModalStore = createCrudModalStore<Vendor>()
