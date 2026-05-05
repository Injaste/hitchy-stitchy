import { createModalStore } from "../../hooks/useModalStore";
import type { Timeline } from "../types";

export const useTimelineModalStore = createModalStore<Timeline>();