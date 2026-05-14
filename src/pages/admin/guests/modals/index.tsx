import { useGuestModalStore } from "../hooks/useGuestModalStore"

import GuestCreateModal from "./GuestCreateModal"
import GuestDetailModal from "./GuestDetailModal"
import GuestEditModal from "./GuestEditModal"
import GuestDeleteModal from "./GuestDeleteModal"
import GuestImportModal from "./GuestImportModal"

const GuestModals = () => {
  // Key the form-bearing edit modal by selectedItem.id so useForm
  // re-initialises with fresh defaults when a different guest is selected.
  const selectedId = useGuestModalStore((s) => s.selectedItem?.id)

  return (
    <>
      <GuestCreateModal />
      <GuestDetailModal />
      <GuestEditModal key={selectedId ?? "none"} />
      <GuestDeleteModal />
      <GuestImportModal />
    </>
  )
}

export default GuestModals
