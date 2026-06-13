import { useMemberModalStore } from "../hooks/useMemberModalStore";

import MemberCreateModal from "./MemberCreateModal";
import MemberDetailModal from "./MemberDetailModal";
import MemberEditModal from "./MemberEditModal";
import MemberDeleteModal from "./MemberDeleteModal";
import MemberFreezeModal from "./MemberFreezeModal";

const MemberModals = () => {
  // Key the form-bearing edit modal by selectedItem.id so useForm
  // re-initialises with fresh defaults when a different member is selected.
  const selectedId = useMemberModalStore((s) => s.selectedItem?.id);

  return (
    <>
      <MemberCreateModal />
      <MemberDetailModal />
      <MemberEditModal key={selectedId ?? "none"} />
      <MemberDeleteModal />
      <MemberFreezeModal />
    </>
  );
};

export default MemberModals;
