import { useState } from "react";
import { useLenis } from "lenis/react";

export const useHasScrolled = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  useLenis((lenis) => setHasScrolled(lenis.scroll > 0));
  return hasScrolled;
};
