import { useExpenseModalStore } from "../hooks/useExpenseModalStore"

import ExpenseCreateModal from "./ExpenseCreateModal"
import ExpenseEditModal from "./ExpenseEditModal"
import ExpenseDeleteModal from "./ExpenseDeleteModal"

const ExpenseModals = () => {
  const selectedId = useExpenseModalStore((s) => s.selectedItem?.id)

  return (
    <>
      <ExpenseCreateModal />
      <ExpenseEditModal key={selectedId ?? "none"} />
      <ExpenseDeleteModal />
    </>
  )
}

export default ExpenseModals
