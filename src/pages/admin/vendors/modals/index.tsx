import { useVendorModalStore } from "../hooks/useVendorModalStore"

import VendorCreateModal from "./VendorCreateModal"
import VendorEditModal from "./VendorEditModal"
import VendorDeleteModal from "./VendorDeleteModal"

const VendorModals = () => {
  const selectedId = useVendorModalStore((s) => s.selectedItem?.id)

  return (
    <>
      <VendorCreateModal />
      <VendorEditModal key={selectedId ?? "none"} />
      <VendorDeleteModal />
    </>
  )
}

export default VendorModals
