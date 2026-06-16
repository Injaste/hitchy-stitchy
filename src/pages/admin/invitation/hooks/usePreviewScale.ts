import { useSyncExternalStore } from "react";

// Unscaled phone-frame dimensions; the preview box renders at these × scale.
export const PHONE_W = 400;
export const PHONE_H = 867;

const MAX_SCALE = 0.9;
const SM = 640; // tailwind `sm`
// Horizontal padding kept around the preview on phones (`max-sm:px-2`, both
// sides), subtracted from the available width so the box fits with the padding.
const GUTTER = 16;

const subscribe = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const getWidth = () => window.innerWidth;

// Preview scale. Normally the original 0.9; on phones (<sm) the 0.9 box (360px)
// can be wider than the screen, so scale to the viewport width instead — still
// capped at 0.9 so it never grows past the desktop size.
export const usePreviewScale = () => {
  const width = useSyncExternalStore(subscribe, getWidth, () => SM);
  return width < SM
    ? Math.min((width - GUTTER) / PHONE_W, MAX_SCALE)
    : MAX_SCALE;
};
