import { useExpenseModalStore } from "../hooks/useExpenseModalStore"

import ExpenseCreateModal from "./ExpenseCreateModal"
import ExpenseEditModal from "./ExpenseEditModal"
import ExpenseDeleteModal from "./ExpenseDeleteModal"

const ExpenseModals = () => {
  const selectedId = useExpenseModalStore((s) => s.selectedItem?.id)
  const createVendorId = useExpenseModalStore((s) => s.createVendorId)
  const createDayId = useExpenseModalStore((s) => s.createDayId)

  return (
    <>
      {/* Keyed on the presets: useExpenseForm captures defaultValues at init, so
          reopening for a different vendor — or the same vendor with the list
          filtered to another day — has to remount to pick them up (same reason
          the edit modal is keyed). */}
      <ExpenseCreateModal key={`${createVendorId ?? "none"}:${createDayId ?? "none"}`} />
      <ExpenseEditModal key={selectedId ?? "none"} />
      <ExpenseDeleteModal />
    </>
  )
}

export default ExpenseModals
