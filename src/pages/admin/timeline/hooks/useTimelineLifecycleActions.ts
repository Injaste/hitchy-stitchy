import { useAdminStore } from "../../store/useAdminStore";
import { useTimelineLifecycleMutations, useActiveTimelineQuery } from "../queries";
import { useTimelineModalStore } from "./useTimelineModalStore";
import { scheduledStartDate, scheduledEndDate } from "../utils";
import type { Timeline } from "../types";

const BUFFER_MIN = 15;

export function useTimelineLifecycleActions() {
  const { eventId } = useAdminStore();
  const { start, end } = useTimelineLifecycleMutations();
  const openConfirm = useTimelineModalStore((s) => s.openConfirm);
  const { data: active } = useActiveTimelineQuery();

  const isEarly = (scheduled: Date | null) =>
    scheduled !== null &&
    Date.now() < scheduled.getTime() - BUFFER_MIN * 60_000;

  const startItem = (item: Timeline) => {
    const otherActive = active && active.id !== item.id ? active : null;

    if (item.started_at !== null) {
      openConfirm({ item, kind: "start", reason: "restart" });
    } else if (isEarly(scheduledStartDate(item))) {
      openConfirm({ item, kind: "start", reason: "early-start" });
    } else if (otherActive) {
      openConfirm({ item, kind: "start", reason: "will-end" });
    } else {
      start.mutate({ event_id: eventId!, id: item.id });
    }
  };

  const endItem = (item: Timeline) => {
    if (isEarly(scheduledEndDate(item))) {
      openConfirm({ item, kind: "end", reason: "early-end" });
    } else {
      end.mutate({ event_id: eventId!, id: item.id });
    }
  };

  return { startItem, endItem, start, end };
}
