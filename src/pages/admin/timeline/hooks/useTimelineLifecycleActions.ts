import { useAdminStore } from "../../store/useAdminStore";
import { usePlan } from "../../hooks/usePlan";
import { useUpgradeModalStore } from "../../plan/hooks/useUpgradeModalStore";
import { useTimelineLifecycleMutations, useActiveTimelineQuery } from "../queries";
import { useTimelineModalStore } from "./useTimelineModalStore";
import { scheduledStartDate, scheduledEndDate } from "../utils";
import type { Timeline } from "../types";

const BUFFER_MIN = 15;

export function useTimelineLifecycleActions() {
  const { eventId } = useAdminStore();
  const { start, end } = useTimelineLifecycleMutations();
  const openConfirm = useTimelineModalStore((s) => s.openConfirm);
  const { canUseFeature } = usePlan();
  const openUpgrade = useUpgradeModalStore((s) => s.open);
  const { data: active } = useActiveTimelineQuery();

  /** Running the day live (start/end cues) is a gated sub-feature — the timeline
   *  module itself is open to every tier. UX gate only; start/end_timeline assert
   *  it server-side too. */
  const liveLocked = !canUseFeature("timeline_liverun");

  const isEarly = (scheduled: Date | null) =>
    scheduled !== null &&
    Date.now() < scheduled.getTime() - BUFFER_MIN * 60_000;

  const startItem = (item: Timeline) => {
    if (liveLocked) {
      openUpgrade({ kind: "feature", feature: "timeline_liverun" });
      return;
    }

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
    const reason = isEarly(scheduledEndDate(item)) ? "early-end" : "confirm-end";
    openConfirm({ item, kind: "end", reason });
  };

  return { startItem, endItem, start, end, liveLocked };
}
