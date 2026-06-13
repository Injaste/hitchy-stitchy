import { useGiftModalStore } from "../hooks/useGiftModalStore"

import GiftCreateModal from "./GiftCreateModal"
import GiftEditModal from "./GiftEditModal"
import GiftDeleteModal from "./GiftDeleteModal"

const GiftModals = () => {
  const selectedId = useGiftModalStore((s) => s.selectedItem?.id)

  return (
    <>
      <GiftCreateModal />
      <GiftEditModal key={selectedId ?? "none"} />
      <GiftDeleteModal />
    </>
  )
}

export default GiftModals
