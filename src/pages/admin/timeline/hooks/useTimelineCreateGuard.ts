import { useTimelineModalStore } from "./useTimelineModalStore";
import { useLimitGuard } from "../../plan/hooks/useLimitGuard";

/** openCreate, gated by the per-tier timeline-item cap. When the event is at its
 *  cap the upgrade modal opens instead of the create form (UX only — create_timeline
 *  asserts the cap server-side too). Shared by every "add item" entry point (header,
 *  empty states, per-segment, per-label) so the gate lives in one place. */
export function useTimelineCreateGuard() {
  const openCreate = useTimelineModalStore((s) => s.openCreate);
  const guardLimit = useLimitGuard();

  return (
    segmentId: string | null,
    label: string | null = null,
    timeStart: string | null = null,
    title: string | null = null,
  ) => {
    if (guardLimit("timeline_items")) return;
    openCreate(segmentId, label, timeStart, title);
  };
}
