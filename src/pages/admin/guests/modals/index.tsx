import { useGuestModalStore } from "../hooks/useGuestModalStore";

import GuestCreateModal from "./GuestCreateModal";
import GuestDetailModal from "./GuestDetailModal";
import GuestEditModal from "./GuestEditModal";
import GuestDeleteModal from "./GuestDeleteModal";
import GuestDuplicateModal from "./GuestDuplicateModal";
import GuestBulkDeleteModal from "./GuestBulkDeleteModal";
import GuestBulkPagesSheet from "./GuestBulkPagesSheet";
import GuestImportModal from "./GuestImportModal";

const GuestModals = () => {
  const selectedId = useGuestModalStore((s) => s.selectedItem?.id);

  return (
    <>
      <GuestCreateModal />
      <GuestDetailModal />
      <GuestEditModal key={selectedId ?? "none"} />
      <GuestDeleteModal />
      <GuestDuplicateModal />
      <GuestBulkDeleteModal />
      <GuestBulkPagesSheet />
      <GuestImportModal />
    </>
  );
};

export default GuestModals;
