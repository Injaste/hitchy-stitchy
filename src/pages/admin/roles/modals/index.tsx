import { useRoleModalStore } from "../hooks/useRoleModalStore"

import RoleCreateModal from "./RoleCreateModal"
import RoleDetailModal from "./RoleDetailModal"
import RoleEditModal from "./RoleEditModal"
import RoleDeleteModal from "./RoleDeleteModal"

const RoleModals = () => {
  // Key the form-bearing edit modal by selectedItem.id so useForm
  // re-initialises with fresh defaults when a different role is selected.
  // (TanStack Form's defaultValues are mount-only.)
  const selectedId = useRoleModalStore((s) => s.selectedItem?.id)

  return (
    <>
      <RoleCreateModal />
      <RoleDetailModal />
      <RoleEditModal key={selectedId ?? "none"} />
      <RoleDeleteModal />
    </>
  )
}

export default RoleModals
