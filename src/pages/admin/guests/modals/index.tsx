import { useGuestModalStore } from "../hooks/useGuestModalStore";

import GuestCreateModal from "./GuestCreateModal";
import GuestDetailModal from "./GuestDetailModal";
import GuestEditModal from "./GuestEditModal";
import GuestDeleteModal from "./GuestDeleteModal";
import GuestDuplicateModal from "./GuestDuplicateModal";
import GuestBulkStatusModal from "./GuestBulkStatusModal";

const GuestModals = () => {
  const selectedId = useGuestModalStore((s) => s.selectedItem?.id);

  return (
    <>
      <GuestCreateModal />
      <GuestDetailModal />
      <GuestEditModal key={selectedId ?? "none"} />
      <GuestDeleteModal />
      <GuestDuplicateModal />
      <GuestBulkStatusModal />
    </>
  );
};

export default GuestModals;
