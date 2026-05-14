import { useTimelineModalStore } from "../hooks/useTimelineModalStore";

import TimelineCreateModal from "./TimelineCreateModal";
import TimelineDetailModal from "./TimelineDetailModal";
import TimelineEditModal from "./TimelineEditModal";
import TimelineDeleteModal from "./TimelineDeleteModal";

const TimelineModals = () => {
  // Key the form-bearing edit modal by selectedItem.id so useForm
  // re-initialises with fresh defaults when a different item is selected.
  const selectedId = useTimelineModalStore((s) => s.selectedItem?.id);

  return (
    <>
      <TimelineCreateModal />
      <TimelineDetailModal />
      <TimelineEditModal key={selectedId ?? "none"} />
      <TimelineDeleteModal />
    </>
  );
};

export default TimelineModals;
