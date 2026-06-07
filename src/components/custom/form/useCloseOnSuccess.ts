import { useEffect, useRef } from "react";

export const useCloseOnSuccess = (
  isSuccess: boolean,
  onClose: () => void,
  delay: number | false = 300,
) => {
  // Keep the latest onClose without making it a dependency. Callers usually pass
  // an inline closure (new identity every render); listing it as a dep would
  // re-run the effect on every render and, while `isSuccess` stays true, keep
  // re-arming the timer — firing `onClose` again on unrelated re-renders.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Fire once per success, on the rising edge — not on every render.
  const firedRef = useRef(false);

  useEffect(() => {
    if (delay === false) return;
    if (!isSuccess) {
      firedRef.current = false;
      return;
    }
    if (firedRef.current) return;
    firedRef.current = true;
    const id = setTimeout(() => onCloseRef.current(), delay);
    return () => clearTimeout(id);
  }, [isSuccess, delay]);
};
