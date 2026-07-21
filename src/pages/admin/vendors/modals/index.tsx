import { useAccess } from "../../hooks/useAccess"
import ExpenseModals from "../../budget/modals"
import { useVendorModalStore } from "../hooks/useVendorModalStore"
import { useVendorFilterDay } from "../hooks/useVendorDayFilter"

import VendorCreateModal from "./VendorCreateModal"
import VendorDetailModal from "./VendorDetailModal"
import VendorEditModal from "./VendorEditModal"
import VendorDeleteModal from "./VendorDeleteModal"

const VendorModals = () => {
  const selectedId = useVendorModalStore((s) => s.selectedItem?.id)
  const dayFilter = useVendorFilterDay()
  const { canRead } = useAccess()

  return (
    <>
      {/* Keyed on the day filter for the same reason the edit modals are keyed
          on their item: useVendorForm captures defaultValues at init, so
          changing the filter has to remount to pick up the new day preset. */}
      <VendorCreateModal key={dayFilter ?? "none"} />
      <VendorDetailModal />
      <VendorEditModal key={selectedId ?? "none"} />
      <VendorDeleteModal />
      {/* The vendor detail's Spend section opens the BUDGET expense modals
          (reused, not reimplemented), so they have to be mounted here too. Only
          for callers who can read budget — the same gate the section uses. */}
      {canRead("budget") && <ExpenseModals />}
    </>
  )
}

export default VendorModals
