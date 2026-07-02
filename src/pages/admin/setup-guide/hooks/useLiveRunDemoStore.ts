import { createDisclosureStore } from "../../hooks/modalStoreFactories";

/** The guide's "Run your day live" practice modal — a self-contained demo of the
 *  timeline live controls. Nothing is persisted and no real cue is started;
 *  opening it completes the view-only "liverun" step. */
export const useLiveRunDemoStore = createDisclosureStore();
