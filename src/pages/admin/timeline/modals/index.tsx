import { useTimelineModalStore } from "../hooks/useTimelineModalStore";

import TimelineCreateModal from "./TimelineCreateModal";
import TimelineDetailModal from "./TimelineDetailModal";
import TimelineEditModal from "./TimelineEditModal";
import TimelineDeleteModal from "./TimelineDeleteModal";

const TimelineModals = () => {
  // Key the form-bearing edit modal by selectedItem.id so useForm
  // re-initialises with fresh defaults when a different item is selected.
  const selectedId = useTimelineModalStore((s) => s.selectedItem?.id);
  // Same idea for create: key by prefill so each open re-inits defaults
  // when the user switches tabs or clicks "+" on a different label group.
  const createPrefill = useTimelineModalStore((s) => s.createPrefill);
  const createKey = `${createPrefill.day ?? ""}|${createPrefill.label ?? ""}`;

  return (
    <>
      <TimelineCreateModal key={createKey} />
      <TimelineDetailModal />
      <TimelineEditModal key={selectedId ?? "none"} />
      <TimelineDeleteModal />
    </>
  );
};

export default TimelineModals;
