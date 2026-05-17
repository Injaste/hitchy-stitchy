import { useGuestModalStore } from "../hooks/useGuestModalStore";

import GuestCreateModal from "./GuestCreateModal";
import GuestDetailModal from "./GuestDetailModal";
import GuestEditModal from "./GuestEditModal";
import GuestDeleteModal from "./GuestDeleteModal";
import GuestImportModal from "./GuestImportModal";
import GuestBulkStatusModal from "./GuestBulkStatusModal";

const GuestModals = () => {
  const selectedId = useGuestModalStore((s) => s.selectedItem?.id);

  return (
    <>
      <GuestCreateModal />
      <GuestDetailModal />
      <GuestEditModal key={selectedId ?? "none"} />
      <GuestDeleteModal />
      <GuestImportModal />
      <GuestBulkStatusModal />
    </>
  );
};

export default GuestModals;
