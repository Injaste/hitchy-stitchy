import { useExpenseModalStore } from "../hooks/useExpenseModalStore"

import ExpenseCreateModal from "./ExpenseCreateModal"
import ExpenseEditModal from "./ExpenseEditModal"
import ExpenseDeleteModal from "./ExpenseDeleteModal"
import VendorQuickCreateModal from "./VendorQuickCreateModal"

const ExpenseModals = () => {
  const selectedId = useExpenseModalStore((s) => s.selectedItem?.id)
  const createVendorId = useExpenseModalStore((s) => s.createVendorId)
  const createDayId = useExpenseModalStore((s) => s.createDayId)
  const vendorCreateDayId = useExpenseModalStore((s) => s.vendorCreateDayId)

  return (
    <>
      {/* Keyed on the presets: useExpenseForm captures defaultValues at init, so
          reopening for a different vendor — or the same vendor with the list
          filtered to another day — has to remount to pick them up (same reason
          the edit modal is keyed). */}
      <ExpenseCreateModal key={`${createVendorId ?? "none"}:${createDayId ?? "none"}`} />
      <ExpenseEditModal key={selectedId ?? "none"} />
      <ExpenseDeleteModal />
      {/* Stacks over the create/edit modals above — a sibling, not a child, so
          the expense form underneath keeps its unsaved state. */}
      <VendorQuickCreateModal key={vendorCreateDayId ?? "none"} />
    </>
  )
}

export default ExpenseModals
