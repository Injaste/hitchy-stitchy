import { createModalStore } from "../../hooks/useModalStore";
import type { TimelineItem } from "../types";

export const useTimelineModalStore = createModalStore<TimelineItem>();